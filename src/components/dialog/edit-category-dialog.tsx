"use client";

import { useState } from "react";
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
import { updateCategoryAction } from "@/actions/board-action";
import Editor from "@/components/editor/advanced-editor";
import { Switch } from "@/components/ui/switch";
import { sanitizeContent } from "@/lib/utils";
import { EditCategoryForm, editCategorySchema } from "@/lib/validations/board";
import { MultiSelect } from "@/components/ui/multi-select";
import { ROLE_OPTIONS } from "@/constant/constant";
import { JSONContent } from "novel";

interface EditCategoryDialogProps {
  initialData: EditCategoryForm & { id: string };
  trigger?: React.ReactNode;
}

export default function EditCategoryDialog({
  initialData,
  trigger,
}: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<JSONContent>(
    typeof initialData.template === "string"
      ? JSON.parse(initialData.template)
      : initialData.template
  );

  const form = useForm<EditCategoryForm>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: initialData.name,
      isUsed: initialData.isUsed,
      roles: initialData.roles || [],
    },
  });

  const onSubmit = async (data: EditCategoryForm) => {
    const sanitizedTemplate = sanitizeContent(template);
    const formData = {
      id: initialData.id,
      ...data,
      template: sanitizedTemplate,
    };

    const result = await updateCategoryAction(initialData.id, formData);
    if (result.success) {
      toast({
        title: "카테고리 수정 완료",
      });
      setOpen(false);
    } else {
      toast({
        title: "카테고리 수정 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>카테고리 수정</DialogTitle>
          <DialogDescription>카테고리를 수정합니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
                      type="button"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>권한</FormLabel>
                  <FormDescription>
                    카테고리를 볼 수 있는 권한을 설정합니다. 권한을 설정하지
                    않으면 조회가 불가능합니다.
                  </FormDescription>
                  <FormControl>
                    <MultiSelect
                      modalPopover={true}
                      options={ROLE_OPTIONS}
                      placeholder="권한을 선택하세요"
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <div className="mt-4 grid gap-2">
          <h1 className="text-lg font-medium">템플릿</h1>
          <p className="text-sm text-muted-foreground">
            게시판에서 카테고리를 선택했을 때 자동적으로 작성되는 템플릿입니다.
          </p>
          <Editor
            initialValue={template}
            onChange={setTemplate}
            immediatelyRender={false}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            취소
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>수정</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
