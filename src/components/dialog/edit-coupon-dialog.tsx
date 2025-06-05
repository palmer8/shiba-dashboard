"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { updateCouponAction } from "@/actions/coupon-action";
import {
  couponEditSchema,
  CouponEditValues,
} from "@/lib/validations/coupon";
import { Plus, Trash2 } from "lucide-react";
import { CouponDisplay } from "@/types/coupon";
import { ItemComboBox } from "@/components/global/item-combo-box";

interface EditCouponDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  coupon: CouponDisplay;
}

export default function EditCouponDialog({
  open,
  setOpen,
  coupon,
}: EditCouponDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CouponEditValues>({
    resolver: zodResolver(couponEditSchema),
    defaultValues: {
      name: "",
      maxcount: undefined,
      start_time: "",
      end_time: "",
      reward_items: [{ itemCode: "", itemName: "", count: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "reward_items",
  });

  // 쿠폰 데이터로 폼 초기화
  useEffect(() => {
    if (coupon && open) {
      const rewardItems = Object.entries(coupon.reward_items).map(([itemCode, itemInfo]) => ({
        itemCode,
        itemName: itemInfo.name, // 아이템 이름 사용
        count: itemInfo.amount, // amount 값 사용
      }));

      form.reset({
        name: coupon.name,
        maxcount: coupon.maxcount || undefined,
        start_time: new Date(coupon.start_time).toISOString().slice(0, 16),
        end_time: new Date(coupon.end_time).toISOString().slice(0, 16),
        reward_items: rewardItems,
      });
    }
  }, [coupon, open, form]);

  const onSubmit = async (values: CouponEditValues) => {
    setIsLoading(true);
    try {
      const result = await updateCouponAction(coupon.id, values);
      if (result.success) {
        toast({
          title: "쿠폰 수정 완료",
          description: `${values.name} 쿠폰이 수정되었습니다.`,
        });
        setOpen(false);
      } else {
        toast({
          title: "쿠폰 수정 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "쿠폰 수정 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>쿠폰 수정</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>쿠폰명 *</FormLabel>
                  <FormControl>
                    <Input placeholder="쿠폰명을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 퍼블릭 쿠폰인 경우에만 사용 제한 횟수 표시 */}
            {coupon.type === "퍼블릭" && (
              <FormField
                control={form.control}
                name="maxcount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사용 제한 횟수</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="무제한은 비워두세요"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 유효기간 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작일시 *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료일시 *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 보상 아이템 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">보상 아이템</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ itemCode: "", itemName: "", count: 1 })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  아이템 추가
                </Button>
              </div>
              
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <FormField
                        control={form.control}
                        name={`reward_items.${index}.itemCode`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>아이템 선택</FormLabel>
                            <FormControl>
                              <ItemComboBox
                                value={field.value}
                                onChange={(value) => {
                                  form.setValue(`reward_items.${index}.itemCode`, value.id);
                                  form.setValue(`reward_items.${index}.itemName`, value.name || "");
                                }}
                                placeholder="아이템을 검색하세요"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`reward_items.${index}.count`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>수량</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="수량"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {form.watch(`reward_items.${index}.itemName`) && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        선택된 아이템: {form.watch(`reward_items.${index}.itemName`)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "수정 중..." : "수정"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
