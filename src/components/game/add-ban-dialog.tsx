"use client";

import { useState, useEffect } from "react";
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
import { addBanDirectlyToDbAction } from "@/actions/ban-action";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { getGameNicknameByUserIdAction } from "@/actions/user-action";

const addBanSchema = z.object({
  user_id: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "이름 필수 (고유번호 입력 시 자동 완성)"),
  identifiers_str: z.string().min(1, "식별자 필수 (쉼표로 구분)"),
  banreason: z.string().min(1, "차단 사유 필수"),
});

type AddBanFormData = z.infer<typeof addBanSchema>;

export default function AddBanDialog() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isMaster = session?.user && hasAccess(session.user.role, UserRole.MASTER);
  const form = useForm<AddBanFormData>({
    resolver: zodResolver(addBanSchema),
    defaultValues: {
      user_id: "",
      name: "",
      identifiers_str: "",
      banreason: "",
    },
  });

  const debouncedUserIdStr = useDebounce(form.watch("user_id"), 500);

  useEffect(() => {
    async function fetchNickname() {
      const userIdNum = parseInt(debouncedUserIdStr || "0");
      if (!userIdNum) {
        form.setValue("name", "");
        form.clearErrors("name");
        return;
      }

      form.setValue("name", "조회 중...");
      const result = await getGameNicknameByUserIdAction(userIdNum);
      if (result.success && result.data) {
        form.setValue("name", result.data);
        form.clearErrors("name");
      } else {
        form.setError("user_id", {
          type: "manual",
          message: result.error || "유효하지 않은 게임 고유번호입니다.",
        });
        form.setValue("name", "");
      }
    }
    fetchNickname();
  }, [debouncedUserIdStr, form]);

  if (!isMaster) return null;

  const onSubmit = async (formData: AddBanFormData) => {
    if (!formData.name || formData.name === "조회 중...") {
      form.setError("name", {
        type: "manual",
        message: "유효한 닉네임을 가져와야 합니다. 고유번호를 확인해주세요.",
      });
      if (debouncedUserIdStr && !form.formState.errors.user_id) {
        form.setError("user_id", {
          type: "manual",
          message: "고유번호로 닉네임을 조회할 수 없습니다.",
        });
      }
      return;
    }

    const identifiersArr = formData.identifiers_str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (identifiersArr.length === 0) {
      form.setError("identifiers_str", {
        type: "manual",
        message: "식별자를 1개 이상 입력하세요",
      });
      return;
    }

    const result = await addBanDirectlyToDbAction({
      user_id: formData.user_id || null,
      name: formData.name,
      banreason: formData.banreason,
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
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>하드밴 등록</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>오프라인 하드밴 등록</DialogTitle>
          <DialogDescription>
            유저 정보를 입력해 하드밴을 등록합니다. user_id는 선택 사항입니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고유번호 (선택 사항)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="숫자 고유번호 입력"
                      type="number"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : e.target.value
                        )
                      }
                    />
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
                  <FormLabel>닉네임 (고유번호 입력 시 자동 완성)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="닉네임" disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identifiers_str"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>식별자 (쉼표 ","로 구분)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="license:xxxx,ip:xxx,..." />
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
                {form.formState.isSubmitting ? "등록 중..." : "등록"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
