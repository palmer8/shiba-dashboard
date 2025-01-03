"use client";

import { JSONContent } from "novel";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Editor from "@/components/editor/advanced-editor";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategoriesAction, updateBoardAction } from "@/actions/board-action";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { sanitizeContent } from "@/lib/utils";
import { MarkdownConverterDialog } from "../dialog/markdown-converter-dialog";

interface Category {
  id: string;
  name: string;
  template: JSONContent | null;
}

interface BoardEditFormProps {
  boardId: string;
  initialData: {
    title: string;
    content: JSONContent;
    categoryId: string;
    isNotice: boolean;
  };
}

export default function BoardEditForm({
  boardId,
  initialData,
}: BoardEditFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState<JSONContent>(initialData.content);
  const [categoryId, setCategoryId] = useState(initialData.categoryId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<JSONContent | null>(
    null
  );
  const [isNotice, setIsNotice] = useState(initialData.isNotice);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategoriesAction();
      if (result.success) {
        setCategories(
          result.data?.map((category) => ({
            id: category.id,
            name: category.name,
            template: category.template as JSONContent | null,
          })) || []
        );
      } else {
        toast({
          title: "카테고리 로드 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (value: string) => {
    const selectedCategory = categories.find((cat) => cat.id === value);
    setCategoryId(value);

    if (selectedCategory?.template) {
      setSelectedTemplate(selectedCategory.template);
      setShowTemplateDialog(true);
    }
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      setContent(selectedTemplate);
    }
    setShowTemplateDialog(false);
  };

  const handleIgnoreTemplate = () => {
    setShowTemplateDialog(false);
  };

  // 컨텐츠가 비어있는지 확인하는 함수
  const isEmptyContent = (content: JSONContent) => {
    if (!content || content.type !== "doc") return true;
    if (!content.content || content.content.length === 0) return true;

    const hasText = content.content.some((node) => {
      if (node.type === "paragraph" && node.content) {
        return node.content.some(
          (child) => child.type === "text" && child.text?.trim()
        );
      }
      return false;
    });

    return !hasText;
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast({
        title: "오류 발생",
        description: "로그인이 필요합니다",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "오류 발생",
        description: "제목을 알맞게 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: "오류 발생",
        description: "카테고리를 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    // 내용이 비어있는지 확인
    if (isEmptyContent(content)) {
      toast({
        title: "오류 발생",
        description: "내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    const handleMarkdownConvert = (convertedContent: JSONContent) => {
      setContent(convertedContent);
      setEditorKey((prev) => prev + 1);
    };

    setIsSubmitting(true);

    try {
      const sanitizedContent = sanitizeContent(content);

      const result = await updateBoardAction({
        id: boardId,
        title: title.trim(),
        content: sanitizedContent,
        categoryId,
        isNotice,
      });

      if (result.success) {
        toast({
          title: "게시글 수정 성공",
        });
        router.push(`/board/${result.data?.id}`);
      } else {
        toast({
          title: "게시글 수정 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update board error:", error);
      toast({
        title: "게시글 수정 실패",
        description:
          (error as Error)?.message || "잠시 후에 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkdownConvert = (convertedContent: JSONContent) => {
    setContent(convertedContent);
    setEditorKey((prev) => prev + 1);
  };

  return (
    <>
      <div className="w-full h-full mx-auto max-w-[1200px]">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          {/* 모바일 헤더 */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <Link
                href={`/board/${boardId}`}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>돌아가기</span>
              </Link>
              <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
                {isSubmitting ? "수정 중..." : "수정"}
              </Button>
            </div>
            <div className="px-4 py-3 flex flex-col gap-3">
              <Input
                type="text"
                value={title}
                autoFocus
                minLength={5}
                maxLength={30}
                className="text-2xl"
                placeholder="제목을 입력해주세요"
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <Select value={categoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {session?.user?.role === "SUPERMASTER" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isNotice-mobile"
                      checked={isNotice}
                      onCheckedChange={(checked) =>
                        setIsNotice(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="isNotice-mobile"
                      className="text-sm font-medium leading-none"
                    >
                      공지사항
                    </label>
                  </div>
                )}
                <MarkdownConverterDialog onConvert={handleMarkdownConvert} />
              </div>
            </div>
          </div>

          {/* 데스크톱 헤더 */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between p-4 h-16">
              <Link
                href={`/board/${boardId}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>돌아가기</span>
              </Link>
              <div className="flex items-center gap-4">
                <Select value={categoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {session?.user?.role === "SUPERMASTER" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isNotice"
                      checked={isNotice}
                      onCheckedChange={(checked) =>
                        setIsNotice(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="isNotice"
                      className="text-sm font-medium leading-none"
                    >
                      공지사항
                    </label>
                  </div>
                )}
                <MarkdownConverterDialog onConvert={handleMarkdownConvert} />
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "수정 중..." : "수정"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 본문 영역 */}
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="hidden sm:block mb-4">
            <Input
              type="text"
              value={title}
              autoFocus
              minLength={5}
              maxLength={30}
              className="font-medium border-0 px-0 focus-visible:ring-0 text-2xl md:text-2xl"
              placeholder="제목을 입력해주세요"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="min-h-[calc(100vh-280px)] sm:min-h-[500px]">
            <Editor
              key={editorKey}
              initialValue={content}
              onChange={(value) => setContent(value)}
              immediatelyRender={false}
            />
          </div>
        </div>
      </div>

      {/* 템플릿 다이얼로그 */}
      <AlertDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
      >
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>템플릿 적용</AlertDialogTitle>
            <AlertDialogDescription>
              이 카테고리에는 템플릿이 있습니다. 템플릿을 적용하시겠습니까?
              <span className="block mt-2 text-destructive">
                ※ 주의: 템플릿을 적용하면 현재 작성 중인 내용이 삭제됩니다.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={handleIgnoreTemplate}
              className="mt-2 sm:mt-0"
            >
              템플릿 무시
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApplyTemplate}
              className="mt-2 sm:mt-0"
            >
              템플릿 적용
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
