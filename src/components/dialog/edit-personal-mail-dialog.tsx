"use client";

import { useState, useEffect, ReactNode } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { getGameNicknameByUserIdAction } from "@/actions/user-action";
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
// import { updatePersonalMailAction } from "@/actions/mail-action";
import { formatKoreanNumber } from "@/lib/utils";
import { X } from "lucide-react";
import {
  EditPersonalMailSchema,
  EditPersonalMailValues,
} from "@/lib/validations/mail";

interface EditPersonalMailDialogProps {
  personalMail: any;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function EditPersonalMailDialog({
  personalMail,
  open,
  setOpen,
}: EditPersonalMailDialogProps) {
  const [nickname, setNickname] = useState<string>("");
  const [isLoadingNickname, setIsLoadingNickname] = useState(false);

  const form = useForm<EditPersonalMailValues>({
    resolver: zodResolver(EditPersonalMailSchema),
    defaultValues: {
      userId: personalMail?.userId?.toString() || "",
      title: personalMail?.title || "",
      content: personalMail?.content || "",
      nickname: "",
      rewards:
        personalMail?.rewards?.map((reward: any) => ({
          type: reward.type as "ITEM" | "MONEY" | "BANK",
          itemId: reward.itemId || "",
          itemName: reward.itemName || "",
          amount: reward.amount,
        })) || [],
      needItems:
        personalMail?.needItems?.map((item: any) => ({
          type: item.type as "MONEY" | "BANK" | "ITEM",
          itemId: item.itemId || "",
          itemName: item.itemName || "",
          amount: item.amount,
        })) || [],
    },
  });

  const debouncedUserId = useDebounce(form.watch("userId"), 500);

  // personalMail prop이 변경될 때마다 폼 값을 업데이트
  useEffect(() => {
    if (personalMail) {
      form.reset({
        userId: personalMail.userId?.toString() || "",
        title: personalMail.title || "",
        content: personalMail.content || "",
        nickname: nickname || "",
        rewards:
          personalMail.rewards?.map((reward: any) => ({
            type: reward.type as "ITEM" | "MONEY" | "BANK",
            itemId: reward.itemId || "",
            itemName: reward.itemName || "",
            amount: reward.amount,
          })) || [],
        needItems:
          personalMail.needItems?.map((item: any) => ({
            type: item.type as "MONEY" | "BANK" | "ITEM",
            itemId: item.itemId || "",
            itemName: item.itemName || "",
            amount: item.amount,
          })) || [],
      });

      // 닉네임도 함께 업데이트
      fetchNickname(personalMail.userId?.toString() || "");
    }
  }, [personalMail, form]);

  // 초기 로딩 시 닉네임 가져오기
  useEffect(() => {
    if (personalMail?.userId) {
      fetchNickname(personalMail.userId.toString());
    }
  }, []);

  // userId가 변경될 때마다 닉네임 조회
  useEffect(() => {
    if (
      debouncedUserId &&
      personalMail?.userId &&
      debouncedUserId !== personalMail.userId.toString()
    ) {
      fetchNickname(debouncedUserId);
    }
  }, [debouncedUserId, personalMail?.userId]);

  // 닉네임 가져오기
  const fetchNickname = async (userId: string) => {
    if (!userId || !/^\d+$/.test(userId)) {
      setNickname("");
      form.setValue("nickname", "");
      return;
    }
    setIsLoadingNickname(true);
    try {
      const result = await getGameNicknameByUserIdAction(Number(userId));
      if (result.success && result.data) {
        setNickname(result.data);
        form.setValue("nickname", result.data);
      } else {
        setNickname("사용자를 찾을 수 없습니다");
        form.setValue("nickname", "");
      }
    } catch (error) {
      setNickname("사용자 조회 중 오류가 발생했습니다");
      form.setValue("nickname", "");
    }
    setIsLoadingNickname(false);
  };

  const handleRewardUpdate = (index: number, field: string, value: any) => {
    const currentRewards = form.getValues("rewards");
    const updatedRewards = currentRewards.map((reward, i) => {
      if (i === index) {
        if (field === "type") {
          return {
            ...reward,
            type: value,
            itemId: value === "ITEM" ? "" : undefined,
            itemName: value === "ITEM" ? "" : undefined,
          };
        }
        if (field === "item") {
          return {
            ...reward,
            itemId: value.id,
            itemName: value.name || "",
          };
        }
        return { ...reward, [field]: value };
      }
      return reward;
    });
    form.setValue("rewards", updatedRewards, {
      shouldValidate: true,
    });
  };

  const handleNeedItemUpdate = (index: number, field: string, value: any) => {
    const currentNeedItems = form.getValues("needItems") || [];
    const updatedNeedItems = currentNeedItems.map((item, i) => {
      if (i === index) {
        if (field === "type") {
          const baseItem =
            value === "ITEM"
              ? {
                  type: "ITEM",
                  itemId: "",
                  itemName: "",
                  amount: item.amount || "1",
                }
              : { type: value as "MONEY" | "BANK", amount: item.amount || "0" };
          return baseItem;
        }
        if (field === "item") {
          return {
            ...item,
            itemId: value.id,
            itemName: value.name || "",
            amount: item.amount || "1",
          };
        }
        if (field === "amount") {
          return {
            ...item,
            amount: value.toString(),
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    form.setValue(
      "needItems",
      updatedNeedItems as EditPersonalMailValues["needItems"],
      {
        shouldValidate: true,
      }
    );
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const submitData = { ...data };

      const withOutNoneIdNeedItem = submitData.needItems?.filter(
        (item) => item.type === "ITEM" && item.itemId !== ""
      );
      submitData.needItems = withOutNoneIdNeedItem;
      const withOutNoneIdRewards = submitData.rewards?.filter(
        (reward) => reward.type === "ITEM" && reward.itemId !== ""
      );
      submitData.rewards = withOutNoneIdRewards;

      // const result = await updatePersonalMailAction(
      //   personalMail.id,
      //   submitData
      // );
      if (/* result.success */ true) {
        toast({ title: "개인 우편 수정 완료" });
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      toast({
        title: "개인 우편 수정 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  });

  const handleRemoveReward = (index: number) => {
    const currentRewards = form.getValues("rewards");
    form.setValue(
      "rewards",
      currentRewards.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[700px] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>개인 우편 수정</DialogTitle>
          <DialogDescription>개인 우편을 수정합니다.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              name="userId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고유번호</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="고유번호를 입력하세요"
                      className="max-w-[200px]"
                      onInput={(e) => {
                        const value = e.currentTarget.value.replace(
                          /[^0-9]/g,
                          ""
                        );
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-muted-foreground">
                    {isLoadingNickname
                      ? "닉네임 조회 중..."
                      : nickname || "고유번호를 입력하세요"}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="제목을 입력해주세요" />
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
                          className="grid grid-cols-[100px,1fr,auto] gap-2 items-start"
                        >
                          <Select
                            value={reward.type}
                            onValueChange={(value) =>
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
                              <div className="flex items-center gap-2">
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
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveReward(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
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

            <FormField
              name="needItems"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>필요 아이템 설정</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value?.map((reward, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[200px,1fr] gap-2"
                        >
                          {reward.type === "ITEM" ? (
                            <>
                              <div className="min-w-0">
                                <ItemComboBox
                                  value={reward.itemId}
                                  onChange={(value) =>
                                    handleNeedItemUpdate(index, "item", value)
                                  }
                                />
                              </div>
                              <Input
                                type="number"
                                min={1}
                                value={reward.amount}
                                onChange={(e) =>
                                  handleNeedItemUpdate(
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
                                    handleNeedItemUpdate(
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
                          const currentNeedItems =
                            form.getValues("needItems") ?? [];
                          form.setValue("needItems", [
                            ...currentNeedItems,
                            {
                              type: "ITEM",
                              itemId: "",
                              itemName: "",
                              amount: "1",
                            },
                          ]);
                        }}
                      >
                        필요 아이템 추가
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
