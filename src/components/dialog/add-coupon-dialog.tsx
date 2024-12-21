"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { createCouponGroupAction } from "@/actions/coupon-action";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemComboBox } from "@/components/global/item-combo-box";
import { generateCouponCode } from "@/lib/utils";
import { X } from "lucide-react";

const CouponGroupSchema = z
  .object({
    groupName: z.string().min(1, "그룹 이름은 필수입니다"),
    groupReason: z.string().min(1, "발급 사유는 필수입니다"),
    groupType: z.string().min(1, "쿠폰 유형은 필수입니다"),
    code: z.string(),
    startDate: z.date({
      required_error: "시작 날짜는 필수입니다",
      invalid_type_error: "올바른 날짜를 입력해주세요",
    }),
    endDate: z.date({
      required_error: "종료 날짜는 필수입니다",
      invalid_type_error: "올바른 날짜를 입력해주세요",
    }),
    usageLimit: z
      .number()
      .min(1, "사용 횟수는 1 이상이어야 합니다")
      .max(999999, "사용 횟수가 너무 큽니다"),
    rewards: z
      .array(
        z.object({
          id: z.string().min(1, "아이템을 선택해주세요"),
          name: z.string(),
          count: z
            .number()
            .min(1, "수량은 1 이상이어야 합니다")
            .max(999999, "수량이 너무 큽니다"),
        })
      )
      .min(1, "보상 정보는 필수입니다"),
    quantity: z.number({
      required_error: "발급 수는 필수입니다",
      invalid_type_error: "발급 수는 숫자여야 합니다",
    }),
  })
  .refine(
    (data) => {
      if (data.groupType === "PUBLIC") {
        return /^[A-Za-z0-9]{8}$/.test(data.code);
      }
      return true;
    },
    {
      path: ["code"],
      message: "쿠폰 번호는 8자리 영문자와 숫자의 조합이어야 합니다",
    }
  )
  .refine(
    (data) => {
      const now = new Date();
      return data.startDate >= now;
    },
    {
      path: ["startDate"],
      message: "시작 날짜는 현재 시간보다 이후여야 합니다",
    }
  )
  .refine(
    (data) => {
      return data.endDate > data.startDate;
    },
    {
      path: ["endDate"],
      message: "종료 날짜는 시작 날짜보다 이후여야 합니다",
    }
  )
  .refine(
    (data) => {
      const diffTime = data.endDate.getTime() - data.startDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 365;
    },
    {
      path: ["endDate"],
      message: "유효 기간은 1년을 초과할 수 없습니다",
    }
  );

export type CouponGroupValues = z.infer<typeof CouponGroupSchema>;

interface AddCouponDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddCouponDialog({
  open,
  setOpen,
}: AddCouponDialogProps) {
  const form = useForm<z.infer<typeof CouponGroupSchema>>({
    resolver: zodResolver(CouponGroupSchema),
    defaultValues: {
      groupName: "",
      groupReason: "",
      groupType: "COMMON",
      code: "",
      startDate: undefined,
      endDate: undefined,
      usageLimit: 1,
      quantity: 0,
      rewards: [],
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await createCouponGroupAction(data);
      if (result) {
        toast({
          title: "쿠폰 그룹 생성 완료",
        });
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      toast({
        title: "쿠폰 그룹 생성 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  });

  const handleGroupTypeChange = (value: string) => {
    if (value === "PUBLIC") {
      form.setValue("code", generateCouponCode());
      form.setValue("quantity", 0);
    } else {
      form.setValue("code", "");
    }
    form.setValue("groupType", value);
  };

  const handleRewardUpdate = (
    index: number,
    field: "id" | "name" | "count",
    value: { id: string; name: string } | number
  ) => {
    const currentRewards = form.getValues("rewards");
    const updatedRewards = currentRewards.map((reward, i) => {
      if (i === index) {
        if (field === "id") {
          const itemValue = value as { id: string; name: string };
          return {
            ...reward,
            id: itemValue.id,
            name: itemValue.name,
            count: reward.count,
          };
        }
        return { ...reward, [field]: value };
      }
      return reward;
    });
    form.setValue("rewards", updatedRewards);
  };

  const handleRemoveReward = (index: number) => {
    const currentRewards = form.getValues("rewards");
    form.setValue(
      "rewards",
      currentRewards.filter((_, i) => i !== index)
    );
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const date = value ? new Date(value) : null;
    form.setValue(field, date as Date);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>그룹 추가</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>쿠폰 그룹 추가</DialogTitle>
          <DialogDescription>
            쿠폰을 관리하기 위한 그룹을 추가합니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              name="groupName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>쿠폰 그룹</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="그룹명을 입력하세요" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="groupReason"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>발급 사유</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="발급 사유를 입력하세요" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="groupType"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>쿠폰 유형</FormLabel>
                  <Select
                    onValueChange={handleGroupTypeChange}
                    value={field.value}
                    defaultValue="COMMON"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="쿠폰 유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COMMON">일반</SelectItem>
                      <SelectItem value="PUBLIC">퍼블릭</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>쿠폰 번호</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={true}
                      maxLength={8}
                      placeholder={
                        form.getValues("groupType") === "PUBLIC"
                          ? "자동 생성됩니다"
                          : "일반 쿠폰은 코드를 입력할 수 없습니다"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <FormLabel>유효 기간</FormLabel>
              <div className="grid gap-2">
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
                                ? new Date(field.value)
                                    .toISOString()
                                    .slice(0, 16)
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
                  <span className="mt-2">~</span>
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
                                ? new Date(field.value)
                                    .toISOString()
                                    .slice(0, 16)
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
            </div>
            <FormField
              name="quantity"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>발급 수</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={form.watch("groupType") === "PUBLIC" ? 0 : 1}
                      {...field}
                      disabled={form.watch("groupType") === "PUBLIC"}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="발급 수를 입력하세요"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="usageLimit"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사용 횟수</FormLabel>
                  <FormDescription>
                    계정당 사용 가능한 횟수를 입력하세요
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="사용 횟수를 입력하세요"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="rewards"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>보상 설정</FormLabel>
                  <FormControl>
                    <div className="grid gap-2">
                      {field.value.map((reward, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <ItemComboBox
                            value={reward.id}
                            onChange={(value) =>
                              handleRewardUpdate(index, "id", value)
                            }
                          />
                          <Input
                            type="number"
                            min={1}
                            value={reward.count}
                            onChange={(e) =>
                              handleRewardUpdate(
                                index,
                                "count",
                                Number(e.target.value)
                              )
                            }
                            placeholder="수량"
                            className="w-24"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveReward(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => {
                          const currentRewards = form.getValues("rewards");
                          form.setValue("rewards", [
                            ...currentRewards,
                            { id: "", name: "", count: 1 },
                          ]);
                        }}
                      >
                        아이템 추가
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
