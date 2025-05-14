"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner"; // sonner 사용을 가정, 기존 use-toast와 다를 수 있음
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { AdminDto } from "@/types/user"; // AdminDto 타입이 정의된 경로로 수정 필요
import { updateUserByMasterAction } from "@/actions/user-action";

// Zod 스키마 정의
const editAdminSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(20, "닉네임은 20자 이하이어야 합니다.")
    .trim(),
  userId: z
    .number({
      required_error: "고유번호를 입력해주세요.",
      invalid_type_error: "고유번호는 숫자여야 합니다.",
    })
    .int("고유번호는 정수여야 합니다.")
    .positive("고유번호는 양수여야 합니다."),
});

type EditAdminFormValues = z.infer<typeof editAdminSchema>;

interface EditAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: AdminDto["items"][number] | null;
  onSuccess?: () => void; // 성공 시 호출될 콜백 (예: 데이터 새로고침)
}

export default function EditAdminDialog({
  isOpen,
  onOpenChange,
  targetUser,
  onSuccess,
}: EditAdminDialogProps) {
  const form = useForm<EditAdminFormValues>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      nickname: "",
      userId: undefined,
    },
  });

  useEffect(() => {
    if (targetUser && isOpen) {
      form.reset({
        nickname: targetUser.nickname || "",
        userId: targetUser.userId || undefined,
      });
    } else if (!isOpen) {
      form.reset({ nickname: "", userId: undefined });
    }
  }, [targetUser, isOpen, form]);

  const onSubmit = async (data: EditAdminFormValues) => {
    if (!targetUser) return;

    const changedData: any = {}; // 타입은 UpdateUserByMasterData로 하는 것이 더 정확
    let hasChanges = false;

    if (data.nickname !== targetUser.nickname) {
      changedData.nickname = data.nickname;
      hasChanges = true;
    }
    if (data.userId !== (targetUser.userId || undefined)) {
      changedData.userId = data.userId;
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.info("변경 사항이 없습니다.");
      onOpenChange(false);
      return;
    }

    try {
      const result = await updateUserByMasterAction(targetUser.id, changedData);

      if (result.success) {
        toast.success(
          `${targetUser.nickname}님의 정보가 성공적으로 변경되었습니다.`
        );
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.error || "정보 변경에 실패했습니다.");
      }
    } catch (error) {
      toast.error("정보 변경 중 오류가 발생했습니다.");
      console.error("Edit admin dialog error:", error);
    }
  };

  if (!targetUser) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset({
            nickname: targetUser.nickname || "",
            userId: targetUser.userId || undefined,
          });
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>관리자 정보 변경</DialogTitle>
          <DialogDescription>
            {targetUser.nickname} (고유번호: {targetUser.userId}) 님의 정보를
            수정합니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>닉네임</FormLabel>
                  <FormControl>
                    <Input placeholder="새 닉네임" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고유번호 (게임 ID)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="새 고유번호 (숫자)"
                      {...field}
                      onChange={(event) =>
                        field.onChange(
                          parseInt(event.target.value, 10) || undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                저장
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
