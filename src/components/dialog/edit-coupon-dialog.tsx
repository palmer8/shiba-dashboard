"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { updateCouponGroupAction } from "@/actions/coupon-action";
import {
  Dialog,
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
import { CouponGroup } from "@/types/coupon";

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

interface EditCouponDialogProps {
  initialData: CouponGroup;
  trigger?: React.ReactNode;
}

export default function EditCouponDialog({
  initialData,
  trigger,
}: EditCouponDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<CouponGroupValues>({
    resolver: zodResolver(CouponGroupSchema),
    defaultValues: {
      groupName: initialData.groupName,
      groupReason: initialData.groupReason,
      groupType: initialData.groupType,
      code: initialData.code || "",
      startDate: new Date(initialData.startDate),
      endDate: new Date(initialData.endDate),
      usageLimit: initialData.usageLimit || 0,
      quantity: initialData.quantity,
      rewards: Array.isArray(initialData.rewards)
        ? initialData.rewards
        : JSON.parse(initialData.rewards as string),
    },
  });

  const handleRewardUpdate = (
    index: number,
    field: "id" | "name" | "count",
    value: string | number | { id: string; name: string }
  ) => {
    const currentRewards = form.getValues("rewards");
    const updatedRewards = [...currentRewards];
    if (field === "id" && typeof value === "object") {
      updatedRewards[index] = {
        ...updatedRewards[index],
        id: value.id,
        name: value.name,
      };
    } else {
      updatedRewards[index] = {
        ...updatedRewards[index],
        [field]: value,
      };
    }
    form.setValue("rewards", updatedRewards);
  };

  const onSubmit = async (data: CouponGroupValues) => {
    try {
      const result = await updateCouponGroupAction(initialData.id, {
        ...data,
        rewards: data.rewards,
      });
      if (result) {
        toast({
          title: "쿠폰 그룹이 수정되었습니다.",
        });
        setOpen(false);
      }
    } catch (error) {
      toast({
        title: "쿠폰 그룹 수정에 실패했습니다.",
        description: "잠시 후에 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </DialogTrigger>
      <DialogContent
        className="max-h-[70vh] overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) return;
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>쿠폰 그룹 수정</DialogTitle>
          <DialogDescription>쿠폰 그룹 정보를 수정합니다.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="groupName"
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
              control={form.control}
              name="groupReason"
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
              control={form.control}
              name="groupType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>쿠폰 유형</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled
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

            {form.watch("groupType") === "PUBLIC" && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>쿠폰 번호</FormLabel>
                    <FormDescription>
                      8자리 영문자와 숫자의 조합으로 입력하세요
                    </FormDescription>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="쿠폰 번호를 입력하세요"
                          maxLength={8}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() =>
                          form.setValue("code", generateCouponCode())
                        }
                      >
                        생성
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작 날짜</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료 날짜</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="quantity"
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                수정
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
