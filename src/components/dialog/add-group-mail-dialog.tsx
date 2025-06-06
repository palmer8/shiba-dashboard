"use client";

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
import { DateTimePicker24h } from "@/components/ui/datetime-picker";
import { createGroupMailReserveAction } from "@/actions/mail-action";
import { formatKoreanNumber } from "@/lib/utils";
import { X } from "lucide-react";
import { GroupMailValues, GroupMailSchema } from "@/lib/validations/mail";

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
      rewards: [],
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
          return {
            ...reward,
            itemId: value.id,
            itemName: value.name || "", // name이 undefined일 경우 빈 문자열로
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
      // UI 데이터를 API 형식으로 변환
      const apiData = {
        title: data.reason, // reason을 title로 매핑
        content: data.content,
        start_time: data.startDate.toISOString(),
        end_time: data.endDate.toISOString(),
        rewards: data.rewards
          .filter(reward => reward.type === "ITEM" && reward.itemId)
          .map(reward => ({
            itemCode: reward.itemId!,
            count: parseInt(reward.amount) || 1,
          }))
      };
      
      const result = await createGroupMailReserveAction(apiData);
      if (result.success) {
        toast({ title: "단체 우편 생성 완료" });
        setOpen(false);
        form.reset();
      } else {
        toast({
          title: "단체 우편 생성 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "단체 우편 생성 실패",
        description: "잠시 후 다시 시도해주세요",
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

  const handleRemoveReward = (index: number) => {
    const currentRewards = form.getValues("rewards");
    form.setValue(
      "rewards",
      currentRewards.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="제목을 작성해주세요" />
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
                  <FormLabel>사유</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="단체 우편 발송 사유를 작성해주세요"
                      className="min-h-[120px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <FormLabel>발송 일자</FormLabel>
              <div className="space-y-2">
                <FormField
                  name="startDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">시작일</FormLabel>
                      <FormControl>
                        <DateTimePicker24h
                          date={field.value}
                          onSelect={(date) => form.setValue("startDate", date as Date)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="endDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">종료일</FormLabel>
                      <FormControl>
                        <DateTimePicker24h
                          date={field.value}
                          onSelect={(date) => form.setValue("endDate", date as Date)}
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
                          className="grid grid-cols-[120px,1fr,120px,50px] gap-3 items-start"
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
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveReward(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
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
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveReward(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
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
