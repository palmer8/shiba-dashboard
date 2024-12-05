"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ItemComboBox } from "@/components/global/item-combo-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createGroupMailAction } from "@/actions/mail-action";
import { formatKoreanNumber } from "@/lib/utils";

const RewardSchema = z
  .object({
    type: z.enum(["MONEY", "BANK", "ITEM"]),
    itemId: z.string().optional(),
    itemName: z.string().optional(),
    amount: z.string(),
  })
  .refine(
    (data) => {
      if (data.type === "ITEM") {
        return data.itemId && data.itemName;
      }
      return true;
    },
    {
      message: "아이템 정보를 선택해주세요",
    }
  );

const GroupMailSchema = z
  .object({
    reason: z.string().min(1, "사유를 입력해주세요"),
    content: z.string().min(10, "내용은 최소 10자 이상이어야 합니다"),
    rewards: z
      .array(RewardSchema)
      .min(1, "최소 1개 이상의 보상을 설정해주세요"),
    startDate: z.date({
      required_error: "시작 날짜를 입력해주세요",
    }),
    endDate: z.date({
      required_error: "종료 날짜를 입력해주세요",
    }),
  })
  .refine(
    (data) => {
      const now = new Date();
      now.setSeconds(0, 0); // 초와 밀리초를 0으로 설정하여 비교
      return data.startDate >= now;
    },
    {
      path: ["startDate"],
      message: "시작 날짜는 현재 시간 이후여야 합니다",
    }
  )
  .refine((data) => data.startDate < data.endDate, {
    path: ["endDate"],
    message: "종료 날짜는 시작 날짜보다 이후여야 합니다",
  });

export type GroupMailValues = z.infer<typeof GroupMailSchema>;

interface AddGroupMailDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AddGroupMailDialog({ open, setOpen }: AddGroupMailDialogProps) {
  const form = useForm<GroupMailValues>({
    resolver: zodResolver(GroupMailSchema),
    defaultValues: {
      reason: "",
      content: "",
      rewards: [
        {
          type: "ITEM",
          itemId: "",
          itemName: "",
          amount: "1",
        },
      ],
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const handleRewardUpdate = (index: number, field: string, value: any) => {
    const currentRewards = form.getValues("rewards");
    const updatedRewards = currentRewards.map((reward, i) => {
      if (i === index) {
        if (field === "type") {
          return value === "ITEM"
            ? { type: "ITEM", itemId: "", itemName: "", amount: "1" }
            : {
                type: value as "MONEY" | "BANK",
                amount: "0",
              };
        }
        if (field === "item") {
          console.log("Selected item:", value); // 디버깅용
          return {
            ...reward,
            itemId: value.id,
            itemName: value.name || "", // name이 undefined일 경우 빈 문자열로 설정
          };
        }
        if (field === "amount") {
          return {
            ...reward,
            amount: value.toString(),
          };
        }
        return { ...reward, [field]: value };
      }
      return reward;
    });
    form.setValue("rewards", updatedRewards as GroupMailValues["rewards"], {
      shouldValidate: true, // 값이 변경될 때마다 유효성 검사 실행
    });
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const date = value ? new Date(value) : null;
    form.setValue(field, date as Date);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const submitData = { ...data };
      const withOutNoneIdRewards = submitData.rewards?.filter(
        (reward) => reward.type === "ITEM" && reward.itemId !== ""
      );
      submitData.rewards = withOutNoneIdRewards;
      const result = await createGroupMailAction(submitData);
      if (result.success) {
        toast({ title: "단체 우편이 생성되었습니다." });
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      toast({
        title: "단체 우편을 생성하지 못했습니다",
        description: "단체 우편을 생성하는 도중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  // Dialog가 닫힐 때 폼 초기화
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>단체 우편 추가</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[700px] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>단체 우편 추가</DialogTitle>
          <DialogDescription>단체 우편을 생성합니다.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              name="reason"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>발급 사유</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="사유를 작성해주세요" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="content"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="내용을 작성해주세요"
                      className="min-h-[150px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <FormLabel>발송 일자</FormLabel>
              <div className="flex items-center gap-2">
                <FormField
                  name="startDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={
                            field.value
                              ? new Date(field.value).toISOString().slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            handleDateChange("startDate", e.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span>~</span>
                <FormField
                  name="endDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={
                            field.value
                              ? new Date(field.value).toISOString().slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            handleDateChange("endDate", e.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              name="rewards"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>보상 설정</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((reward, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[180px,1fr,auto] gap-2"
                        >
                          <Select
                            value={reward.type}
                            onValueChange={(value: any) =>
                              handleRewardUpdate(index, "type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="보상 유형" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ITEM">아이템</SelectItem>
                              <SelectItem value="MONEY">현금</SelectItem>
                              <SelectItem value="BANK">계좌</SelectItem>
                            </SelectContent>
                          </Select>

                          {reward.type === "ITEM" ? (
                            <>
                              <div className="min-w-0">
                                <ItemComboBox
                                  value={reward.itemId}
                                  onChange={(value) =>
                                    handleRewardUpdate(index, "item", value)
                                  }
                                />
                              </div>
                              <Input
                                type="number"
                                min={1}
                                value={reward.amount}
                                onChange={(e) =>
                                  handleRewardUpdate(
                                    index,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                placeholder="수량"
                                className="w-24"
                              />
                            </>
                          ) : (
                            <>
                              <div className="space-y-1">
                                <Input
                                  type="number"
                                  min={1}
                                  value={reward.amount}
                                  onChange={(e) =>
                                    handleRewardUpdate(
                                      index,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  placeholder="금액"
                                />
                                <div className="text-sm text-muted-foreground">
                                  {formatKoreanNumber(
                                    parseInt(reward.amount) || 0
                                  )}
                                  원
                                </div>
                              </div>
                              <div className="w-24" />
                            </>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const currentRewards = form.getValues("rewards");
                          form.setValue("rewards", [
                            ...currentRewards,
                            {
                              type: "ITEM",
                              itemId: "",
                              itemName: "",
                              amount: "1",
                            },
                          ]);
                        }}
                      >
                        보상 추가
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                추가
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
