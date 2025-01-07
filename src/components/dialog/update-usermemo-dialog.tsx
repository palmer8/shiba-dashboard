"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
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
import { Textarea } from "@/components/ui/textarea";
import { updateMemoAction } from "@/actions/realtime/realtime-action";
import { Session } from "next-auth";
import { UserMemo } from "@/types/realtime";

const updateMemoSchema = z.object({
  text: z.string().min(1, "메모 내용을 입력해주세요"),
});

type UpdateMemoFormData = z.infer<typeof updateMemoSchema>;

interface UpdateUserMemoDialogProps {
  userId: number;
  session: Session;
  open: boolean;
  setOpen: (open: boolean) => void;
  memo: UserMemo;
  onClose: () => void;
}

export default function UpdateUserMemoDialog({
  userId,
  session,
  open,
  setOpen,
  memo,
  onClose,
}: UpdateUserMemoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateMemoFormData>({
    resolver: zodResolver(updateMemoSchema),
    defaultValues: {
      text: memo.text,
    },
  });

  const onSubmit = async (data: UpdateMemoFormData) => {
    try {
      setIsLoading(true);
      const result = await updateMemoAction(memo, data.text);

      if (result.success) {
        toast({
          title: "메모 수정 완료",
          description: "메모가 성공적으로 수정되었습니다.",
        });
        onClose();
      } else {
        toast({
          title: "메모 수정 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "메모 수정 실패",
        description: "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleClose();
        setOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>특이사항 수정</DialogTitle>
          <DialogDescription>
            해당 유저의 특이사항을 수정합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모 내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="메모 내용을 입력하세요"
                      className="resize-none"
                      {...field}
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
                onClick={handleClose}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "수정 중..." : "수정"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
