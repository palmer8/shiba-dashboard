"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getGameNicknameByUserIdAction,
  signUpAction,
} from "@/actions/user-action";
import { SignUpFormValues, signUpSchema } from "@/lib/validations/auth";

export function SignUpForm() {
  const router = useRouter();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
      userId: 0,
      nickname: "",
    },
  });

  const debouncedUserId = useDebounce(form.watch("userId"), 500);

  useEffect(() => {
    async function fetchNickname() {
      if (!debouncedUserId) {
        form.setValue("nickname", "");
        return;
      }

      const result = await getGameNicknameByUserIdAction(debouncedUserId);
      if (result.success && result.data) {
        form.setValue("nickname", result.data);
      } else {
        form.setError("userId", {
          type: "manual",
          message: "유효하지 않은 게임 계정입니다.",
        });
        form.setValue("nickname", "");
      }
    }
    fetchNickname();
  }, [debouncedUserId, form]);

  async function onSubmit(data: SignUpFormValues) {
    try {
      const result = await signUpAction(data);

      if (!result.success) {
        toast({
          title: "회원가입 실패",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (data.userId === 1) {
        toast({
          title: "회원가입 성공",
          description: "도꾸님 환영합니다. 슈퍼 마스터 계정으로 활성화되었습니다.",
        });
      } else {
        toast({
          title: "회원가입 성공",
          description: "관리자 승인 후 이용하실 수 있습니다.",
        });
      }

      router.replace("/login");
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>아이디</FormLabel>
              <FormControl>
                <Input placeholder="아이디" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>고유번호</FormLabel>
              <FormControl>
                <Input
                  placeholder="고유번호"
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numberValue = value ? Number(value) : "";
                    field.onChange(numberValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>닉네임</FormLabel>
              <FormControl>
                <Input placeholder="닉네임" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호 확인</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          회원가입
        </Button>
      </form>
    </Form>
  );
}
