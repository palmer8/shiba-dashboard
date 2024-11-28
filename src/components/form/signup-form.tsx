"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "아이디는 2글자 이상이어야 합니다.")
    .max(20, "아이디는 20글자를 초과할 수 없습니다."),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
    .max(20, "비밀번호는 20자를 초과할 수 없습니다.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "비밀번호는 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다."
    ),
  userId: z.string().min(1, "고유번호를 입력해주세요"),
  nickname: z.string().min(1, "고유번호에 따른 닉네임을 찾을 수 없습니다."),
});

type FormValues = z.infer<typeof formSchema>;

export function SignUpForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
      userId: "",
      nickname: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("회원가입에 실패했습니다.");
      }

      toast.success("회원가입이 완료되었습니다.");
      router.push("/login");
    } catch (error) {
      toast.error("회원가입 중 오류가 발생했습니다.");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>고유번호</FormLabel>
              <FormControl>
                <Input placeholder="게임에서 사용하는 고유번호" {...field} />
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormDescription>
                영문 대/소문자, 숫자, 특수문자를 포함한 8자 이상
              </FormDescription>
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
                <Input
                  placeholder="고유번호에 따라 자동으로 삽입됩니다."
                  {...field}
                  disabled
                />
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
