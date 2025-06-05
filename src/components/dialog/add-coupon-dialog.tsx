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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createCouponAction } from "@/actions/coupon-action";
import {
  couponCreateSchema,
  CouponCreateValues,
} from "@/lib/validations/coupon";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { generateCouponCode } from "@/lib/utils";
import { ItemComboBox } from "@/components/global/item-combo-box";
import { DateTimePicker24h } from "@/components/ui/datetime-picker";

interface AddCouponDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddCouponDialog({
  open,
  setOpen,
}: AddCouponDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CouponCreateValues>({
    resolver: zodResolver(couponCreateSchema),
    defaultValues: {
      name: "",
      type: "일반",
      code: "",
      quantity: 1,
      maxcount: undefined,
      start_time: new Date(),
      end_time: new Date(),
      reward_items: [{ itemCode: "", itemName: "", count: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "reward_items",
  });

  const watchType = form.watch("type");

  // 퍼블릭 쿠폰 선택 시 랜덤 코드 자동 생성
  useEffect(() => {
    if (watchType === "퍼블릭") {
      const randomCode = generateCouponCode();
      form.setValue("code", randomCode);
    } else {
      form.setValue("code", "");
    }
  }, [watchType, form]);

  // 랜덤 코드 재생성 함수
  const generateNewCode = () => {
    const newCode = generateCouponCode();
    form.setValue("code", newCode);
  };

  const onSubmit = async (values: CouponCreateValues) => {
    setIsLoading(true);
    try {
      const result = await createCouponAction(values);
      if (result.success) {
        toast({
          title: "쿠폰 생성 완료",
          description: `${values.name} 쿠폰이 생성되었습니다.`,
        });
        form.reset();
        setOpen(false);
      } else {
        toast({
          title: "쿠폰 생성 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "쿠폰 생성 실패",
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
          <DialogTitle>쿠폰 추가</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>쿠폰 타입 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="쿠폰 타입 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="일반">일반</SelectItem>
                        <SelectItem value="퍼블릭">퍼블릭</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 타입별 설정 */}
            {watchType === "일반" && (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>발급 수량 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="발급할 쿠폰 수량"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchType === "퍼블릭" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>쿠폰 코드 *</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="쿠폰 코드" 
                            {...field}
                            className="font-mono"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateNewCode}
                            className="px-3"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
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
                      <DateTimePicker24h
                        date={field.value}
                        onSelect={(date) => {
                          field.onChange(date || new Date());
                        }}
                      />
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
                      <DateTimePicker24h
                        date={field.value}
                        onSelect={(date) => {
                          field.onChange(date || new Date());
                        }}
                      />
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
                {isLoading ? "생성 중..." : "생성"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
