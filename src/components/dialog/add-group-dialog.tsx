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
import {
  updateUserGroupAction,
  updateUserGroupByGroupMenuAction,
} from "@/actions/realtime/realtime-group-action";
import { toast } from "@/hooks/use-toast";
import { GroupComboBox } from "@/components/global/group-combo-box";

const addGroupSchema = z.object({
  groupName: z.string().min(1, "그룹 이름을 입력해주세요."),
});

interface AddGroupDialogProps {
  userId: number;
  page: "group" | "user";
  onSuccess?: () => void;
}

export default function AddGroupDialog({
  userId,
  page,
  onSuccess,
}: AddGroupDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(addGroupSchema),
    defaultValues: {
      groupName: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof addGroupSchema>) {
    if (!userId) return;

    if (page === "group") {
      const result = await updateUserGroupByGroupMenuAction({
        user_id: Number(userId),
        group: data.groupName,
        action: "add",
      });
      if (result.success) {
        toast({
          title: "그룹 추가 완료",
        });
        setOpen(false);
        form.reset();
        onSuccess?.();
        return;
      } else {
        toast({
          title: "그룹 추가 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    }

    const result = await updateUserGroupAction({
      user_id: Number(userId),
      group: data.groupName,
      action: "add",
    });

    if (result.success) {
      toast({
        title: "그룹 추가 완료",
      });
      setOpen(false);
      form.reset();
    } else {
      toast({
        title: "그룹 추가 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">그룹 추가</Button>
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
                    <GroupComboBox {...field} />
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
              <Button
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
                type="submit"
              >
                추가
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
