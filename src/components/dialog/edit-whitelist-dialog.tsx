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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateWhitelistAction } from "@/actions/report-action";
import { WhitelistIP } from "@/types/report";
import { WHITELIST_STATUS } from "@/constant/constant";
import {
  EditWhitelistForm,
  editWhitelistSchema,
} from "@/lib/validations/report";

interface EditWhitelistDialogProps {
  initialData: WhitelistIP;
  trigger: React.ReactNode;
}

export default function EditWhitelistDialog({
  initialData,
  trigger,
}: EditWhitelistDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<EditWhitelistForm>({
    resolver: zodResolver(editWhitelistSchema),
    defaultValues: {
      id: initialData.id,
      user_ip: initialData.user_ip,
      comment: initialData.comment || "",
      status: initialData.status.toString(),
    },
  });

  const onSubmit = async (data: EditWhitelistForm) => {
    const result = await updateWhitelistAction({
      id: data.id,
      user_ip: data.user_ip,
      comment: data.comment,
      status: parseInt(data.status),
    });

    if (result.success) {
      toast({
        title: "해당 IP 관리 항목 수정 성공",
        description: "해당 IP 관리 항목이 성공적으로 수정되었습니다.",
      });
      setOpen(false);
    } else {
      toast({
        title: "해당 IP 관리 항목 수정 실패",
        description: "해당 IP 관리 항목 수정에 실패했습니다.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>화이트리스트 수정</DialogTitle>
          <DialogDescription>화이트리스트 정보를 수정합니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP 주소</FormLabel>
                  <FormDescription>
                    와일드카드(*)를 사용하여 IP 대역을 지정할 수 있습니다.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="예시: 111.111.111.111 또는 111.111.*.*"
                      className="h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <FormDescription>
                    해당 IP 관리 항목의 상태를 선택해주세요.
                  </FormDescription>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="상태를 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(WHITELIST_STATUS).map(
                          ([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormDescription>
                    해당 IP 관리 항목의 설명을 입력해주세요.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="예시: 내부 네트워크 IP 대역 추가"
                      className="h-20"
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
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                수정
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
