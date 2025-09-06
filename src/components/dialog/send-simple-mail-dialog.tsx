"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  // 로컬 스토리지 키 생성
  const getStorageKey = useCallback(() => {
    return `mail_draft_${userId}`;
  }, [userId]);

  // 로컬 스토리지에서 데이터 불러오기
  const loadDraftFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('로컬 스토리지에서 데이터 불러오기 실패:', error);
      return null;
    }
  }, [getStorageKey]);

  // 로컬 스토리지에 데이터 저장
  const saveDraftToStorage = useCallback((data: Partial<SimpleMailValues>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
    } catch (error) {
      console.error('로컬 스토리지에 데이터 저장 실패:', error);
    }
  }, [getStorageKey]);

  // 로컬 스토리지에서 데이터 삭제
  const clearDraftFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error('로컬 스토리지에서 데이터 삭제 실패:', error);
    }
  }, [getStorageKey]);

  // 템플릿 로딩 함수
  const loadTemplates = useCallback(async () => {
    // 이미 로딩 중이거나 로드된 경우 중복 로딩 방지
    if (isTemplateLoading || templatesLoaded) return;

    setIsTemplateLoading(true);
    try {
      const result = await getMailTemplatesAction(0);
      if (result.success && result.data) {
        setTemplates(result.data.templates);
        setTemplatesLoaded(true);
      }
    } catch (error) {
      console.error("템플릿 로딩 실패:", error);
      toast({
        title: "템플릿 로딩 실패",
        description: "메일 템플릿을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsTemplateLoading(false);
    }
  }, [isTemplateLoading, templatesLoaded]);

  const form = useForm<SimpleMailValues>({
    resolver: zodResolver(simpleMailSchema),
    defaultValues: {
      user_id: userId,
      title: "",
      content: "",
      nickname: userData.last_nickname || "",
    },
  });

  // 다이얼로그 열 때 저장된 데이터 복원 및 템플릿 로딩
  useEffect(() => {
    if (open) {
      const draft = loadDraftFromStorage();
      if (draft) {
        form.reset({
          user_id: userId,
          title: draft.title || "",
          content: draft.content || "",
          nickname: userData.last_nickname || "",
        });
      }
      // 템플릿 로딩 (다이얼로그 열릴 때만)
      loadTemplates();
    } else {
      // 다이얼로그 닫힐 때 상태 리셋
      setTemplatesLoaded(false);
      setTemplates([]);
    }
  }, [open, userId, userData.last_nickname, form, loadDraftFromStorage, loadTemplates]);

  // 폼 값 변경 시 자동 저장
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (open && value.title !== "" || value.content !== "") {
        saveDraftToStorage({
          title: value.title || "",
          content: value.content || "",
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, open, saveDraftToStorage]);

  // 템플릿 목록 새로고침
  const refreshTemplates = useCallback(async () => {
    setIsTemplateLoading(true);
    setTemplatesLoaded(false); // 로딩 상태 리셋
    try {
      const result = await getMailTemplatesAction(0);
      if (result.success && result.data) {
        setTemplates(result.data.templates);
        setTemplatesLoaded(true);
      }
    } catch (error) {
      console.error("템플릿 로딩 실패:", error);
      toast({
        title: "템플릿 로딩 실패",
        description: "메일 템플릿을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsTemplateLoading(false);
    }
  }, []);

  // 템플릿 선택 핸들러
  const handleTemplateSelect = useCallback((templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      form.setValue("title", selectedTemplate.title);
      form.setValue("content", selectedTemplate.content);
    }
  }, [templates, form]);

  const onSubmit = useCallback(async (data: SimpleMailValues) => {
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
        // 메일 발송 성공 시 임시저장 데이터 삭제
        clearDraftFromStorage();
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
  }, [userId, setOpen, form, clearDraftFromStorage]);

  const handleCloseWithSave = useCallback(() => {
    // ESC나 X 버튼으로 닫을 때: 값 보존 (자동 저장됨)
    setOpen(false);
  }, [setOpen]);

  const handleCloseWithCancel = useCallback(() => {
    // 취소 버튼으로 닫을 때: 초기화 및 임시저장 데이터 삭제
    form.reset();
    clearDraftFromStorage();
    setOpen(false);
  }, [form, clearDraftFromStorage, setOpen]);

  return (
    <Dialog open={open} onOpenChange={handleCloseWithSave}>
      <DialogContent
        className="sm:max-w-[600px]"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleCloseWithSave();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          handleCloseWithSave();
        }}
      >
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
                    <SelectValue
                      placeholder={
                        isTemplateLoading
                          ? "템플릿 로딩중..."
                          : templates.length === 0 && templatesLoaded
                            ? "등록된 템플릿 없음"
                            : "템플릿 선택 (선택사항)"
                      }
                    />
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
                onClick={handleCloseWithCancel}
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
