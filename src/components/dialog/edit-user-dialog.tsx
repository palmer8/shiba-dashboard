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
import { updateUserAction } from "@/actions/user-action";
import { Session } from "@prisma/client";

interface EditUserDialogProps {
  session: any;
  trigger: React.ReactNode;
}

const schema = z.object({
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다"),
  image: z.string().url("올바른 URL을 입력해주세요").optional().nullable(),
});

export default function EditUserDialog({
  session,
  trigger,
}: EditUserDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      nickname: session?.user.nickname || "",
      image: session?.user.image || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const result = await updateUserAction(session.user?.id, data);

      if (result.success) {
        toast({
          title: "계정 정보가 수정되었습니다.",
        });
        setOpen(false);
      } else {
        toast({
          title: "계정 정보 수정에 실패했습니다.",
          description: "잠시 후에 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "계정 정보 수정에 실패했습니다.",
        description: "잠시 후에 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>계정 정보 수정</DialogTitle>
          <DialogDescription>
            계정의 기본 정보를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>닉네임</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="닉네임을 입력하세요" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프로필 이미지 URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="이미지 URL을 입력하세요"
                      value={field.value || ""}
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
