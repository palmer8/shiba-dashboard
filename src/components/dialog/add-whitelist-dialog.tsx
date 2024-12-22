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
import { Input } from "@/components/ui/input";
import { createWhitelistAction } from "@/actions/report-action";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select,
} from "@/components/ui/select";
import { WHITELIST_STATUS } from "@/constant/constant";
import { WhitelistForm, whitelistSchema } from "@/lib/validations/report";

export default function AddWhitelistDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<WhitelistForm>({
    resolver: zodResolver(whitelistSchema),
    defaultValues: {
      user_ip: "",
      comment: "",
      status: "0",
    },
  });

  const onSubmit = async (data: z.infer<typeof whitelistSchema>) => {
    const ips = data.user_ip.split("\n").filter((ip) => ip.trim() !== "");

    const result = await createWhitelistAction({
      user_ip: ips,
      comment: data.comment,
      status: parseInt(data.status),
    });

    if (result.success) {
      toast({
        title: "IP 관리 티켓 등록 성공",
        description: "IP가 성공적으로 등록되었습니다.",
      });
      setOpen(false);
      form.reset();
    } else {
      toast({
        title: "IP 관리 티켓 등록 실패",
        description: "IP 관리 티켓 등록에 실패했습니다.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>IP 추가</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>IP 관리 항목 추가</DialogTitle>
          <DialogDescription>관리 할 IP를 추가합니다.</DialogDescription>
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
                    여러 IP를 등록하려면 줄바꿈으로 구분해주세요.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder={`예시: 111.111.111.111\n222.222.222.*`}
                      className="h-32"
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
                    <Input placeholder="설명을 입력해주세요" {...field} />
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
                등록
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
