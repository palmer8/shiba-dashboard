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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getMailTemplatesAction,
  createMailTemplateAction,
  updateMailTemplateAction,
  deleteMailTemplateAction,
} from "@/actions/mail-action";
import { MailTemplate, MailTemplateList } from "@/types/mail";
import { MailTemplateValues, mailTemplateSchema } from "@/lib/validations/mail";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { formatKoreanDateTime } from "@/lib/utils";

interface MailTemplateManagementProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onTemplateChange?: () => void;
}

export function MailTemplateManagement({
  open,
  setOpen,
  onTemplateChange,
}: MailTemplateManagementProps) {
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MailTemplate | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const form = useForm<MailTemplateValues>({
    resolver: zodResolver(mailTemplateSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // 템플릿 목록 로드
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const result = await getMailTemplatesAction(0);
      if (result.success && result.data) {
        setTemplates(result.data.templates);
      } else {
        toast({
          title: "템플릿 로드 실패",
          description: result.error || "템플릿 목록을 불러올 수 없습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "템플릿 로드 실패",
        description: "템플릿 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  // 템플릿 생성
  const handleCreate = async (data: MailTemplateValues) => {
    try {
      const result = await createMailTemplateAction(data.title, data.content);
      if (result.success) {
        toast({
          title: "템플릿 생성 성공",
          description: "메일 템플릿이 성공적으로 생성되었습니다.",
        });
        setCreateDialogOpen(false);
        form.reset();
        loadTemplates();
        onTemplateChange?.();
      } else {
        toast({
          title: "템플릿 생성 실패",
          description: result.error || "템플릿 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "템플릿 생성 실패",
        description: "템플릿 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 템플릿 수정
  const handleUpdate = async (data: MailTemplateValues) => {
    if (!editingTemplate) return;

    try {
      const result = await updateMailTemplateAction(
        editingTemplate.id,
        data.title,
        data.content
      );
      if (result.success) {
        toast({
          title: "템플릿 수정 성공",
          description: "메일 템플릿이 성공적으로 수정되었습니다.",
        });
        setEditingTemplate(null);
        form.reset();
        loadTemplates();
        onTemplateChange?.();
      } else {
        toast({
          title: "템플릿 수정 실패",
          description: result.error || "템플릿 수정 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "템플릿 수정 실패",
        description: "템플릿 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 템플릿 삭제
  const handleDelete = async (template: MailTemplate) => {
    if (!confirm(`"${template.title}" 템플릿을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await deleteMailTemplateAction(template.id);
      if (result.success) {
        toast({
          title: "템플릿 삭제 성공",
          description: "메일 템플릿이 성공적으로 삭제되었습니다.",
        });
        loadTemplates();
        onTemplateChange?.();
      } else {
        toast({
          title: "템플릿 삭제 실패",
          description: result.error || "템플릿 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "템플릿 삭제 실패",
        description: "템플릿 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 수정 모드 시작
  const startEdit = (template: MailTemplate) => {
    setEditingTemplate(template);
    form.setValue("title", template.title);
    form.setValue("content", template.content);
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditingTemplate(null);
    form.reset();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>메일 템플릿 관리</DialogTitle>
            <DialogDescription>
              자주 사용하는 메일 양식을 템플릿으로 관리할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              새 템플릿
            </Button>
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-muted-foreground">로딩중...</div>
              </div>
            ) : templates.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-muted-foreground">등록된 템플릿이 없습니다.</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>내용</TableHead>
                    <TableHead>등록자</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="w-20">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        {template.title}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={template.content}>
                          {template.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        {template.registrant?.nickname || "알 수 없음"}
                      </TableCell>
                      <TableCell>
                        {formatKoreanDateTime(template.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => startEdit(template)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(template)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 템플릿 생성/수정 다이얼로그 */}
      <Dialog
        open={createDialogOpen || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingTemplate(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "템플릿 수정" : "새 템플릿 생성"}
            </DialogTitle>
            <DialogDescription>
              메일 템플릿 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                editingTemplate ? handleUpdate : handleCreate
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="템플릿 제목을 입력하세요"
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setEditingTemplate(null);
                    form.reset();
                  }}
                >
                  취소
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "처리중..."
                    : editingTemplate
                    ? "수정"
                    : "생성"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
