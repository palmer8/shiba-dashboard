"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  updateUserGroupAction,
  updateUserGroupByGroupMenuAction,
} from "@/actions/realtime/realtime-group-action";
import { toast } from "@/hooks/use-toast";

const addGroupSchema = z.object({
  groupName: z.string().min(1, "그룹 이름을 입력해주세요."),
});

interface AddGroupDialogProps {
  userId: number;
}

export default function AddGroupDialog({ userId }: AddGroupDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(addGroupSchema),
    defaultValues: {
      groupName: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof addGroupSchema>) {
    if (!userId) return;

    const result = await updateUserGroupAction({
      user_id: Number(userId),
      group: data.groupName,
      action: "add",
    });

    if (result.success) {
      toast({
        title: "그룹이 추가되었습니다.",
      });
      setOpen(false);
      form.reset();
    } else {
      toast({
        title: "그룹 추가에 실패했습니다.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>그룹 추가</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>유저 그룹 추가</DialogTitle>
          <DialogDescription>
            해당 유저에게 그룹을 추가합니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>그룹 이름</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit">추가</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
