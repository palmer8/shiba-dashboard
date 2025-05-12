"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { addBanAction } from "@/actions/ban-action";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";

const addBanSchema = z.object({
  user_id: z.string().min(1, "고유번호 필수"),
  name: z.string().min(1, "이름 필수"),
  identifiers: z.string().min(1, "식별자 필수"),
  banreason: z.string().min(1, "차단 사유 필수"),
});

type AddBanFormData = z.infer<typeof addBanSchema>;

export default function AddBanDialog() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isMaster = hasAccess(session?.user?.role, UserRole.MASTER);
  const form = useForm<AddBanFormData>({
    resolver: zodResolver(addBanSchema),
    defaultValues: {
      user_id: "",
      name: "",
      identifiers: "",
      banreason: "",
    },
  });

  if (!isMaster) return null;

  const onSubmit = async (data: AddBanFormData) => {
    const identifiersArr = data.identifiers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (identifiersArr.length === 0) {
      toast({ title: "식별자를 1개 이상 입력하세요", variant: "destructive" });
      return;
    }
    const result = await addBanAction({
      user_id: data.user_id,
      name: data.name,
      banreason: data.banreason,
      identifiers: identifiersArr,
    });
    if (result.success) {
      toast({ title: "하드밴 등록 성공" });
      setOpen(false);
      form.reset();
    } else {
      toast({
        title: "하드밴 등록 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>하드밴 등록</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>오프라인 하드밴 등록</DialogTitle>
          <DialogDescription>
            유저 정보를 입력해 하드밴을 등록합니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고유번호</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="유저 고유번호" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="유저 이름" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identifiers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>식별자(여러 개 입력 시 ,로 구분)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="license:xxxx, ip:xxx, ..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="banreason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>차단 사유</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="차단 사유" />
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
                등록
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
