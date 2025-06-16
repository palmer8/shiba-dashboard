// board-write-form.tsx

"use client";

import { JSONContent } from "novel";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/editor/advanced-editor";
import { toast } from "@/hooks/use-toast";
import { getCategoriesAction, createBoardAction } from "@/actions/board-action";
import { useSession } from "next-auth/react";
import { DEFAULT_EDITOR_CONTENT } from "@/constant/constant";
import { sanitizeContent } from "@/lib/utils";
import { CommonFormLayout } from "@/components/boards/common-form-layout";
import { BoardCategory } from "@prisma/client";

interface Draft {
  id: string;
  title: string;
  content: JSONContent;
  category: string;
  lastSaved: string;
}

export default function BoardWriteForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent>(DEFAULT_EDITOR_CONTENT);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<BoardCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotice, setIsNotice] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategoriesAction();
      if (result.success) {
        setCategories(result.data || []);
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

  // 드래프트 선택 핸들러
  const handleDraftSelect = useCallback((draft: Draft) => {
    setTitle(draft.title);
    setContent(draft.content);
    setCategoryId(draft.category);
    setEditorKey((prev) => prev + 1);
  }, []);

  const handleCategoryChange = (isTemplate: boolean, value: string) => {
    const selectedCategory = categories.find((cat) => cat.id === value);
    const isEmptyTemplate = (template: JSONContent | null) => {
      if (!template) return true;
      if (template.type !== "doc") return true;
      if (!template.content || template.content.length === 0) return true;
      return false;
    };

    if (
      selectedCategory?.template &&
      !isEmptyTemplate(selectedCategory.template as JSONContent)
    ) {
      setCategoryId(value);
      if (isTemplate) {
        setContent(selectedCategory.template as JSONContent);
        setEditorKey((prev) => prev + 1);
      } else {
        setEditorKey((prev) => prev + 1);
      }
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
        // 임시 저장 삭제는 CommonFormLayout에서 처리됩니다.
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

  return (
    <>
      <CommonFormLayout
        setContent={setContent}
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
        showNoticeOption={true}
        onMarkdownConvert={handleMarkdownConvert}
        onDraftSelect={handleDraftSelect}
        content={content}
        canSaveDraft={true} // 임시 저장 기능 활성화
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
    </>
  );
}
