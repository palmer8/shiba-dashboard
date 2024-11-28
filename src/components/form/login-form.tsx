"use client";

import * as React from "react";
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
import { signIn } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { isAccountPermissiveAction } from "@/actions/user-action";

const formSchema = z.object({
  name: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    const isPermissive = await isAccountPermissiveAction(
      data.name,
      data.password
    );

    console.log("isPermissive response:", isPermissive);

    if (!isPermissive) {
      console.log("isPermissive is undefined");
      toast({
        title: "서버 오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
      return;
    }

    if (isPermissive.data === false && isPermissive.success) {
      toast({
        title: isPermissive.message,
        description: "관리자에게 문의해주세요.",
        variant: "destructive",
      });
      return;
    } else if (isPermissive.success === false || isPermissive.error) {
      toast({
        title: isPermissive.message,
        variant: "destructive",
      });
      return;
    }

    // if (isPermissive.data === true && isPermissive.success) {
    //   const result = await signIn("credentials", {
    //     name: data.name,
    //     password: data.password,
    //     redirect: false,
    //     redirectTo: "/",
    //   });

    //   if (result?.error) {
    //     toast({
    //       title: "로그인 중 에러가 발생하였습니다",
    //       description: "잠시 후에 다시 시도해주세요",
    //       variant: "destructive",
    //     });
    //     return;
    //   }

    //   router.push("/");
    // }
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
                <Input placeholder="아이디" type="text" {...field} />
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
