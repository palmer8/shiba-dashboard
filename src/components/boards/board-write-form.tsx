"use client";

import { JSONContent } from "novel";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Editor from "@/components/editor/advanced-editor";
import { toast } from "@/hooks/use-toast";
import { getCategoriesAction, createBoardAction } from "@/actions/board-action";
import { useSession } from "next-auth/react";
import { DEFAULT_EDITOR_CONTENT } from "@/constant/constant";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { sanitizeContent } from "@/lib/utils";
import { CommonFormLayout } from "@/components/boards/common-form-layout";

interface Category {
  id: string;
  name: string;
  template: JSONContent | null;
}

interface Draft {
  id: string;
  title: string;
  content: JSONContent;
  category: string;
  lastSaved: string;
}

function DraftList({
  onSelect,
  onDelete,
}: {
  onSelect: (draft: Draft) => void;
  onDelete: (id: string) => void;
}) {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const loadDrafts = () => {
      const allDrafts: Draft[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("draft_")) {
          try {
            const draft = JSON.parse(localStorage.getItem(key) || "");
            allDrafts.push({ ...draft, id: key });
          } catch (e) {
            console.error("Draft parse error:", e);
          }
        }
      }
      setDrafts(
        allDrafts.sort(
          (a, b) =>
            new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime()
        )
      );
    };

    loadDrafts();
  }, []);

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        임시저장된 글이 없습니다.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <button
              onClick={() => onSelect(draft)}
              className="flex-1 text-left"
            >
              <h4 className="font-medium truncate">{draft.title}</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(draft.lastSaved), "yyyy.MM.dd HH:mm")}
              </p>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(draft.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

const DRAFT_COOKIE_KEY = "board_draft";
export default function BoardWriteForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent>(DEFAULT_EDITOR_CONTENT);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<{
    id: string;
    template: JSONContent;
  } | null>(null);
  const [isNotice, setIsNotice] = useState(false);
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
      const result = await createBoardAction({
        title: title.trim(),
        content: sanitizeContent(content),
        categoryId,
        isNotice,
      });

      if (result.success) {
        toast({ title: "게시글 작성 완료" });
        router.push(`/board/${result.data?.id}`);
        router.refresh();
      } else {
        toast({
          title: "게시글 작성 실패",
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
      setContent(DEFAULT_EDITOR_CONTENT);
      setEditorKey((prev) => prev + 1);
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
        submitText="작성"
        backHref="/boards"
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
              {content !== DEFAULT_EDITOR_CONTENT && (
                <span className="block mt-2 text-destructive">
                  ※ 주의: 템플릿을 적용하면 현재 작성 중인 내용이 삭제됩니다.
                </span>
              )}
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
