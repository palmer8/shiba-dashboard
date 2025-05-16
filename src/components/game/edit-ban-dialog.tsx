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
import { editBanDirectlyInDbAction } from "@/actions/ban-action";
import { z } from "zod";
import { useDebounce } from "@/hooks/use-debounce";
import { getGameNicknameByUserIdAction } from "@/actions/user-action";

// 스키마 수정
const editBanSchema = z.object({
  user_id: z.string().optional().or(z.literal("")), // 고유번호 (선택적이나, 있으면 닉네임 자동완성)
  name: z.string().min(1, "닉네임 필수 (고유번호 입력 시 자동 완성)"), // 닉네임 (자동완성, disabled)
  banreason: z.string().min(1, "차단 사유 필수"),
});

type EditBanFormData = z.infer<typeof editBanSchema>;

interface EditBanDialogProps {
  id: string; // Ban ID (수정 대상)
  initialUserId: string | null;
  initialName: string;
  initialBanreason: string;
  initialIdentifiers: string[]; // 식별자는 이 다이얼로그에서 수정하지 않지만, 액션에는 전달
  trigger: React.ReactNode;
}

export default function EditBanDialog({
  id,
  initialUserId,
  initialName,
  initialBanreason,
  initialIdentifiers,
  trigger,
}: EditBanDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<EditBanFormData>({
    resolver: zodResolver(editBanSchema),
    defaultValues: {
      user_id: initialUserId || "",
      name: initialName || "",
      banreason: initialBanreason,
    },
  });

  const debouncedUserIdStr = useDebounce(form.watch("user_id"), 500);

  useEffect(() => {
    // Dialog가 열릴 때, 또는 initial 값들이 변경될 때 form 값을 리셋
    if (open) {
      form.reset({
        user_id: initialUserId || "",
        name: initialName || "",
        banreason: initialBanreason,
      });
    }
  }, [open, initialUserId, initialName, initialBanreason, form]);

  useEffect(() => {
    async function fetchNickname() {
      const userIdNum = parseInt(debouncedUserIdStr || "0");
      // 현재 form의 user_id가 initialUserId와 다를 때만 API 호출 (최초 로드 시 불필요한 호출 방지 위함)
      // 또는 initialUserId가 없는데, 새로 입력한 경우
      if (
        debouncedUserIdStr !== (initialUserId || "") ||
        (!initialUserId && debouncedUserIdStr)
      ) {
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
          form.clearErrors("user_id");
        } else {
          form.setError("user_id", {
            type: "manual",
            message: result.error || "유효하지 않은 게임 고유번호입니다.",
          });
          form.setValue("name", "");
        }
      }
    }
    // user_id 필드가 활성화 되어 사용자가 직접 수정할 때만 fetchNickname 호출
    // 여기서는 최초 로드 시 initial 값으로 세팅하고, 사용자가 user_id를 수정할 경우 fetchNickname이 발동하도록 함.
    // 만약 initialUserId가 있다면, 초기 name은 initialName을 사용한다.
    // 사용자가 user_id를 initialUserId와 다르게 변경했을 때만 fetchNickname이 실행되도록 조건 추가
    if (debouncedUserIdStr !== (initialUserId || "")) {
      fetchNickname();
    }
  }, [debouncedUserIdStr, form, initialUserId, initialName]); // initialName 추가

  const onSubmit = async (formData: EditBanFormData) => {
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

    const result = await editBanDirectlyInDbAction({
      id, // 어떤 ban record를 수정할지 ID
      user_id: formData.user_id || null,
      name: formData.name,
      banreason: formData.banreason,
      identifiers: initialIdentifiers, // 식별자는 변경 X, 기존 값 그대로 전달
    });

    if (result.success) {
      toast({ title: "하드밴 정보 수정 성공" });
      setOpen(false);
    } else {
      toast({
        title: "하드밴 정보 수정 실패",
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
        // 다이얼로그 닫힐 때 폼 리셋 (initial 값으로)
        if (!isOpen) {
          form.reset({
            user_id: initialUserId || "",
            name: initialName || "",
            banreason: initialBanreason,
          });
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>하드밴 정보 수정</DialogTitle>
          <DialogDescription>
            하드밴 고유번호 및 차단 사유를 수정합니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고유번호 (수정 시 닉네임 자동 변경)</FormLabel>
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
                  <FormLabel>닉네임 (자동 완성)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="닉네임" disabled />
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
                {form.formState.isSubmitting ? "수정 중..." : "수정"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
