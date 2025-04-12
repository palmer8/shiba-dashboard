"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
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
import { updateUserDiscordIdAction } from "@/actions/realtime/realtime-action";

interface EditDiscordIdDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  gameUserId: number;
  currentDiscordId: string | null; // 현재 DB에 저장된 ID (접두어 제외)
  mutate?: () => void; // 데이터 갱신 함수
}

const formSchema = z.object({
  newDiscordId: z
    .string()
    .min(1, "Discord ID를 입력해주세요.")
    .regex(/^\d+$/, "숫자만 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditDiscordIdDialog({
  open,
  setOpen,
  gameUserId,
  currentDiscordId,
  mutate,
}: EditDiscordIdDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newDiscordId: currentDiscordId || "", // 현재 ID가 있으면 기본값으로 설정
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const result = await updateUserDiscordIdAction(
        gameUserId,
        values.newDiscordId
      );

      if (result.success) {
        toast({
          title: "Discord ID 변경 성공",
          description: `사용자 ${gameUserId}의 Discord ID가 변경되었습니다.`,
        });
        mutate?.(); // 데이터 갱신
        setOpen(false); // 다이얼로그 닫기
      } else {
        toast({
          title: "Discord ID 변경 실패",
          description: result.error || "ID 변경 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "Discord ID 변경 중 예상치 못한 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Discord ID 변경</DialogTitle>
          <DialogDescription>
            사용자(ID: {gameUserId})의 Discord ID를 변경합니다. 올바른 사용자
            ID를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newDiscordId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>새 Discord ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="사용자 ID (숫자만) 입력"
                      {...field}
                      onInput={(e) => {
                        // 입력 시 숫자 외 문자 제거
                        const value = e.currentTarget.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "변경 중..." : "변경"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
