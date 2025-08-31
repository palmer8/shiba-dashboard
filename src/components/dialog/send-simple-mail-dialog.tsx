"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { sendSimpleMailAction } from "@/actions/mail-action";
import { SimpleMailValues, simpleMailSchema } from "@/lib/validations/mail";
import { RealtimeGameUserData } from "@/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMailTemplatesAction } from "@/actions/mail-action";
import { MailTemplate } from "@/types/mail";
import { useRouter } from "next/navigation";
import { MailTemplateManagement } from "@/components/mail/mail-template-management";
import { Settings } from "lucide-react";

interface SendSimpleMailDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userData: RealtimeGameUserData;
  userId: number;
          onTemplateChange?: () => Promise<void>;
}

export function SendSimpleMailDialog({
  open,
  setOpen,
  userData,
  userId,
  onTemplateChange,
}: SendSimpleMailDialogProps) {
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [templateManagementOpen, setTemplateManagementOpen] = useState(false);

  const form = useForm<SimpleMailValues>({
    resolver: zodResolver(simpleMailSchema),
    defaultValues: {
      user_id: userId,
      title: "",
      content: "",
      nickname: userData.last_nickname || "",
    },
  });

  // 템플릿 목록 불러오기
  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    setIsTemplateLoading(true);
    try {
      const result = await getMailTemplatesAction(0);
      if (result.success && result.data) {
        setTemplates(result.data.templates);
      }
    } catch (error) {
      console.error("템플릿 로딩 실패:", error);
    } finally {
      setIsTemplateLoading(false);
    }
  };

  // 템플릿 목록 새로고침
  const refreshTemplates = async () => {
    setIsTemplateLoading(true);
    try {
      const result = await getMailTemplatesAction(0);
      if (result.success && result.data) {
        setTemplates(result.data.templates);
      }
    } catch (error) {
      console.error("템플릿 로딩 실패:", error);
    } finally {
      setIsTemplateLoading(false);
    }
  };

  // 템플릿 선택 핸들러
  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      form.setValue("title", selectedTemplate.title);
      form.setValue("content", selectedTemplate.content);
    }
  };

  const onSubmit = async (data: SimpleMailValues) => {
    try {
      const result = await sendSimpleMailAction({
        user_id: userId,
        title: data.title,
        content: data.content,
        nickname: data.nickname,
      });

      if (result.success) {
        toast({
          title: "메일 발송 성공",
          description: "메일이 성공적으로 발송되었습니다.",
        });
        setOpen(false);
        form.reset();
      } else {
        toast({
          title: "메일 발송 실패",
          description: result.error || "메일 발송 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "메일 발송 실패",
        description: "메일 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>메일 발송</DialogTitle>
          <DialogDescription>
            {userData.last_nickname}님에게 메일을 발송합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 템플릿 선택 */}
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>메일 템플릿 (선택사항)</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTemplateManagementOpen(true)}
                  className="h-6 px-2"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  관리
                </Button>
              </div>
              <FormControl>
                <Select onValueChange={handleTemplateSelect} disabled={isTemplateLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={isTemplateLoading ? "로딩중..." : "템플릿 선택"} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>

            {/* 제목 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="메일 제목을 입력하세요"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 내용 */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="메일 내용을 입력하세요"
                      className="min-h-[150px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 수신자 정보 (읽기 전용) */}
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>수신자 ID</FormLabel>
                <FormControl>
                  <Input value={userId} disabled className="bg-muted" />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>수신자 닉네임</FormLabel>
                <FormControl>
                  <Input
                    value={userData.last_nickname || ""}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "발송중..." : "발송"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <MailTemplateManagement
        open={templateManagementOpen}
        setOpen={(open) => {
          setTemplateManagementOpen(open);
          // 템플릿 관리가 끝나면 목록 새로고침
          if (!open) {
            refreshTemplates();
            onTemplateChange?.();
          }
        }}
      />
    </Dialog>
  );
}
