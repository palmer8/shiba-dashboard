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
import { createChunobotAction } from "@/actions/realtime/realtime-action";

const addChunobotSchema = z.object({
  reason: z.string().min(1, "내용을 입력해주세요"),
});

type AddChunobotFormData = z.infer<typeof addChunobotSchema>;

interface AddChunobotDialogProps {
  userId: number;
  session: Session;
  open: boolean;
  setOpen: (open: boolean) => void;
  mutate: () => Promise<any>;
}

export default function AddChunobotDialog({
  userId,
  session,
  open,
  setOpen,
  mutate,
}: AddChunobotDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddChunobotFormData>({
    resolver: zodResolver(addChunobotSchema),
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = async (data: AddChunobotFormData) => {
    try {
      setIsLoading(true);
      const result = await createChunobotAction(
        userId,
        session.user!.nickname,
        data.reason
      );

      if (result.success) {
        toast({
          title: "유저 메모 등록 완료",
          description: "유저메모가 성공적으로 등록되었습니다.",
        });
        form.reset();
        setOpen(false);
        await mutate();
      } else {
        toast({
          title: "유저 메모 등록 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "유저 메모 등록 실패",
        description: "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>유저 메모 등록</DialogTitle>
          <DialogDescription>해당 유저의 메모를 등록합니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
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
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "등록 중..." : "등록"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
