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
import { Input } from "@/components/ui/input";
import { createCategoryAction } from "@/actions/board-action";
import Editor from "../editor/advanced-editor";
import { Switch } from "../ui/switch";

const categorySchema = z.object({
  name: z.string().min(1, {
    message: "카테고리 이름을 입력해주세요.",
  }),
  isUsed: z.boolean(),
  template: z.any(),
});

export type CategoryForm = z.infer<typeof categorySchema>;

export default function AddCategoryDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      isUsed: false,
      template: {},
    },
  });

  const onSubmit = async (data: CategoryForm) => {
    const formData = {
      ...data,
      template: JSON.stringify(data.template),
    };

    const result = await createCategoryAction(formData);

    if (result.success) {
      toast({
        title: "카테고리 등록 성공",
        description: "카테고리가 성공적으로 등록되었습니다.",
      });
      setOpen(false);
      form.reset();
    } else {
      toast({
        title: "카테고리 등록 실패",
        description: "카테고리 등록에 실패했습니다.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>카테고리 추가</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>카테고리 추가</DialogTitle>
          <DialogDescription>카테고리를 추가합니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="카테고리 이름" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사용 여부</FormLabel>
                  <FormDescription>노출 여부를 설정합니다.</FormDescription>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>템플릿</FormLabel>
                  <FormDescription>
                    게시판에서 카테고리를 선택했을 때 자동적으로 작성되는
                    템플릿입니다.
                  </FormDescription>
                  <FormControl>
                    <Editor {...field} />
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