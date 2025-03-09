"use client";

import { useState, useEffect } from "react";
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
import {
  editCouponGroupSchema,
  EditCouponGroupValues,
} from "@/lib/validations/coupon";

interface EditCouponDialogProps {
  couponGroup: CouponGroup;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function EditCouponDialog({
  couponGroup,
  open,
  setOpen,
}: EditCouponDialogProps) {
  const form = useForm<EditCouponGroupValues>({
    resolver: zodResolver(editCouponGroupSchema),
    defaultValues: {
      groupName: couponGroup?.groupName || "",
      groupReason: couponGroup?.groupReason || "",
      groupType: couponGroup?.groupType || "COMMON",
      code: couponGroup?.code || "",
      startDate: couponGroup?.startDate
        ? new Date(couponGroup.startDate)
        : new Date(),
      endDate: couponGroup?.endDate
        ? new Date(couponGroup.endDate)
        : new Date(),
      usageLimit: couponGroup?.usageLimit || 0,
      quantity: couponGroup?.quantity || 0,
      rewards: Array.isArray(couponGroup?.rewards)
        ? couponGroup.rewards
        : couponGroup?.rewards
        ? JSON.parse(couponGroup.rewards as string)
        : [],
    },
  });

  useEffect(() => {
    if (couponGroup) {
      form.reset({
        groupName: couponGroup.groupName || "",
        groupReason: couponGroup.groupReason || "",
        groupType: couponGroup.groupType || "COMMON",
        code: couponGroup.code || "",
        startDate: couponGroup.startDate
          ? new Date(couponGroup.startDate)
          : new Date(),
        endDate: couponGroup.endDate
          ? new Date(couponGroup.endDate)
          : new Date(),
        usageLimit: couponGroup.usageLimit || 0,
        quantity: couponGroup.quantity || 0,
        rewards: Array.isArray(couponGroup.rewards)
          ? couponGroup.rewards
          : couponGroup.rewards
          ? JSON.parse(couponGroup.rewards as string)
          : [],
      });
    }
  }, [couponGroup, form]);

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

  const onSubmit = async (data: EditCouponGroupValues) => {
    try {
      const result = await updateCouponGroupAction(couponGroup.id, {
        ...data,
        rewards: data.rewards,
      });
      if (result) {
        toast({
          title: "쿠폰 그룹 수정 완료",
        });
        setOpen(false);
      }
    } catch (error) {
      toast({
        title: "쿠폰 그룹 수정 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
