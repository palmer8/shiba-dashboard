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
import { Session } from "next-auth";
import { updateChunobotAction } from "@/actions/realtime/realtime-action";
import { Chunobot } from "@/types/user";

const updateChunobotSchema = z.object({
  reason: z.string().min(1, "내용을 입력해주세요"),
});

type UpdateChunobotFormData = z.infer<typeof updateChunobotSchema>;

interface UpdateChunobotDialogProps {
  session: Session;
  open: boolean;
  setOpen: (open: boolean) => void;
  chunobot: Chunobot;
  onClose: () => void;
  mutate: () => Promise<any>;
}

export default function UpdateChunobotDialog({
  open,
  setOpen,
  chunobot,
  onClose,
  mutate,
}: UpdateChunobotDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateChunobotFormData>({
    resolver: zodResolver(updateChunobotSchema),
    defaultValues: {
      reason: chunobot.reason,
    },
  });

  const onSubmit = async (data: UpdateChunobotFormData) => {
    try {
      setIsLoading(true);
      const result = await updateChunobotAction(chunobot.user_id, data.reason);

      if (result.success) {
        toast({
          title: "추노 알림 수정 완료",
          description: "추노 알림이 성공적으로 수정되었습니다.",
        });
        onClose();
        await mutate();
      } else {
        toast({
          title: "추노 알림 수정 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "추노 알림 수정 실패",
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
          <DialogTitle>추노 알림 수정</DialogTitle>
          <DialogDescription>해당 추노 알림을 수정합니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>추노 알림 내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="추노 알림 내용을 입력하세요"
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
