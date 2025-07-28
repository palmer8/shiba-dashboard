"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { signIn } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { LoginFormValues, loginSchema } from "@/lib/validations/auth";
import { Checkbox } from "../ui/checkbox";

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: "",
      password: "",
      autoLogin: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      const result = await signIn("credentials", {
        name: data.name,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "로그인 실패",
          description: "계정이 존재하지 않습니다, 다시 한번 확인해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 자동 로그인 상태를 쿠키로 관리
      if (data.autoLogin) {
        // 2일(172800초) 유지되는 영구 쿠키
        document.cookie = "stayLogin=true; max-age=172800; path=/";
        // 세션용 쿠키 제거
        document.cookie = "stayLoginSession=; max-age=0; path=/";
      } else {
        // 브라우저 세션 동안만 유지되는 세션 쿠키 (만료 지정 안 함)
        document.cookie = "stayLoginSession=true; path=/";
        // 영구 쿠키 제거
        document.cookie = "stayLogin=; max-age=0; path=/";
      }

      router.replace("/");
    } catch (error) {
      console.error(error);
      toast({
        title: "시스템 오류",
        description: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
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
          name="autoLogin"
          render={({ field }) => (
            <FormItem className="flex justify-end">
              <div className="flex items-center gap-2">
                <FormLabel className="text-sm text-muted-foreground">
                  자동 로그인
                </FormLabel>
                <FormControl className="mt-0">
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    name={field.name}
                    onBlur={field.onBlur}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          로그인
        </Button>
      </form>
    </Form>
  );
}
