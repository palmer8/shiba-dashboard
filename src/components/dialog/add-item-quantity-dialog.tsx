"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { getGameNicknameByUserIdAction } from "@/actions/user-action";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ItemComboBox } from "@/components/global/item-combo-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createItemQuantityAction } from "@/actions/quantity-action";
import {
  ItemQuantitySchema,
  ItemQuantityValues,
} from "@/lib/validations/quantity";

interface AddItemQuantityDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddItemQuantityDialog({
  open,
  setOpen,
}: AddItemQuantityDialogProps) {
  const [nickname, setNickname] = useState<string>("");
  const [isLoadingNickname, setIsLoadingNickname] = useState(false);

  const form = useForm<ItemQuantityValues>({
    resolver: zodResolver(ItemQuantitySchema),
    defaultValues: {
      userId: "",
      nickname: "",
      itemId: "",
      itemName: "",
      amount: "1",
      type: "ADD",
      reason: "",
    },
  });

  const debouncedUserId = useDebounce(form.watch("userId"), 500);

  // 닉네임 가져오기
  const fetchNickname = async (userId: string) => {
    if (!userId || !/^\d+$/.test(userId)) {
      setNickname("");
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

  useEffect(() => {
    fetchNickname(debouncedUserId);
  }, [debouncedUserId]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await createItemQuantityAction(data);
      if (result.success) {
        toast({ title: "아이템 지급/회수 티켓 생성 완료" });
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      toast({
        title: "아이템 지급/회수 티켓 생성 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>아이템 지급/회수</DialogTitle>
          <DialogDescription>
            해당 유저에게 아이템 지급/회수 티켓을 작성합니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고유번호</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="고유번호를 입력하세요" />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">
                    {isLoadingNickname ? "조회중..." : nickname}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>처리 유형</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="처리 유형 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADD">지급</SelectItem>
                      <SelectItem value="REMOVE">회수</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>아이템</FormLabel>
                  <FormControl>
                    <ItemComboBox
                      value={field.value}
                      onChange={(value) => {
                        form.setValue("itemId", value.id);
                        form.setValue("itemName", value.name || "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>수량</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      placeholder="수량을 입력하세요"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사유</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="사유를 입력하세요" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                생성
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
