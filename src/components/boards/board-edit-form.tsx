"use client";

import { JSONContent } from "novel";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/editor/advanced-editor";
import { toast } from "@/hooks/use-toast";
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
import { CommonFormLayout } from "@/components/boards/common-form-layout";

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
  const [pendingCategory, setPendingCategory] = useState<{
    id: string;
    template: JSONContent;
  } | null>(null);
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
    const isEmptyTemplate = (template: JSONContent | null) => {
      if (!template) return true;
      if (template.type !== "doc") return true;
      if (!template.content || template.content.length === 0) return true;
      return false;
    };

    if (
      selectedCategory?.template &&
      !isEmptyTemplate(selectedCategory.template)
    ) {
      setPendingCategory({
        id: value,
        template: selectedCategory.template,
      });
      setShowTemplateDialog(true);
    } else {
      setCategoryId(value);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!title.trim()) {
      toast({ title: "제목을 입력해주세요" });
      return;
    }
    if (!categoryId) {
      toast({ title: "카테고리를 선택해주세요" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateBoardAction({
        id: boardId,
        title: title.trim(),
        content: sanitizeContent(content),
        categoryId,
        isNotice,
      });

      if (result.success) {
        toast({ title: "게시글 수정 완료" });
        router.push(`/board/${boardId}`);
        router.refresh();
      } else {
        toast({
          title: "게시글 수정 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkdownConvert = (convertedContent: JSONContent) => {
    setContent(convertedContent);
    setEditorKey((prev) => prev + 1);
  };

  const handleApplyTemplate = () => {
    if (pendingCategory) {
      setCategoryId(pendingCategory.id);
      setContent(pendingCategory.template);
      setEditorKey((prev) => prev + 1);
    }
    setShowTemplateDialog(false);
    setPendingCategory(null);
  };

  const handleIgnoreTemplate = () => {
    if (pendingCategory) {
      setCategoryId(pendingCategory.id);
    }
    setShowTemplateDialog(false);
    setPendingCategory(null);
  };

  return (
    <>
      <CommonFormLayout
        onBack={() => router.back()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText="수정"
        backHref={`/board/${boardId}`}
        title={title}
        setTitle={setTitle}
        category={categoryId}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        isNotice={isNotice}
        onNoticeChange={setIsNotice}
        showNoticeOption={session?.user?.role === "SUPERMASTER"}
        onMarkdownConvert={handleMarkdownConvert}
      >
        <div className="min-h-[calc(100vh-280px)] sm:min-h-[500px]">
          <Editor
            key={editorKey}
            initialValue={content}
            onChange={setContent}
            immediatelyRender={false}
          />
        </div>
      </CommonFormLayout>

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
