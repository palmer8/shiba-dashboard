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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { sanitizeContent } from "@/lib/utils";
import { MarkdownConverterDialog } from "../dialog/markdown-converter-dialog";

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
  const [content, setContent] = useState<JSONContent>(DEFAULT_EDITOR_CONTENT);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isNotice, setIsNotice] = useState(false);
  const [showDraftList, setShowDraftList] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<{
    id: string;
    template: JSONContent | null;
  } | null>(null);

  const handleCategoryChange = (value: string) => {
    const selectedCategory = categories.find((cat) => cat.id === value);

    if (selectedCategory?.template) {
      setPendingCategory({
        id: value,
        template: selectedCategory.template,
      });
      setShowTemplateDialog(true);
    } else {
      setCategory(value);
      setContent(DEFAULT_EDITOR_CONTENT);
      setEditorKey((prev) => prev + 1);
    }
  };

  const handleApplyTemplate = () => {
    if (pendingCategory) {
      setCategory(pendingCategory.id);
      if (pendingCategory.template) {
        setContent(pendingCategory.template);
      } else {
        setContent(DEFAULT_EDITOR_CONTENT);
      }
      setEditorKey((prev) => prev + 1);
    }
    setShowTemplateDialog(false);
    setPendingCategory(null);
  };

  const handleIgnoreTemplate = () => {
    if (pendingCategory) {
      setCategory(pendingCategory.id);
    }
    setShowTemplateDialog(false);
    setPendingCategory(null);
  };

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
          description: "카테고리 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_COOKIE_KEY);
    if (draft) {
      const draftData = JSON.parse(draft);
      setHasDraft(true);
      setShowDraftDialog(true);
    }
  }, []);

  const handleSaveDraft = () => {
    if (
      !title.trim() ||
      JSON.stringify(content) === JSON.stringify(DEFAULT_EDITOR_CONTENT)
    ) {
      toast({
        title: "임시저장 실패",
        description: "제목과 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const draftId = `draft_${new Date().getTime()}`;
    const draftData = {
      title,
      content,
      category,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(draftId, JSON.stringify(draftData));
    toast({
      title: "임시저장 완료",
      description: "작성 중인 내용이 저장되었습니다.",
    });
  };

  const handleSelectDraft = (draft: Draft) => {
    setTitle(draft.title);
    setContent(draft.content);
    setCategory(draft.category);
    setEditorKey((prev) => prev + 1);
    setShowDraftList(false);
  };

  const handleDeleteDraft = (id: string) => {
    localStorage.removeItem(id);
    toast({
      title: "임시저장 삭제",
      description: "선택한 임시저장 글이 삭제되었습니다.",
    });
    if (showDraftList) {
      setShowDraftList(false);
      setTimeout(() => setShowDraftList(true), 100);
    }
  };

  const handleIgnoreDraft = () => {
    localStorage.removeItem(DRAFT_COOKIE_KEY);
    setShowDraftDialog(false);
    setHasDraft(false);
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem(DRAFT_COOKIE_KEY);
    if (draft) {
      const draftData = JSON.parse(draft);
      setTitle(draftData.title);
      setContent(draftData.content);
      setCategory(draftData.category);
      setEditorKey((prev) => prev + 1);
      localStorage.removeItem(DRAFT_COOKIE_KEY);
    }
    setShowDraftDialog(false);
    setHasDraft(false);
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      return router.replace("/login");
    }

    if (!title.trim()) {
      toast({
        title: "제목을 알맞게 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "카테고리를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const sanitizedContent = sanitizeContent(content);

      const result = await createBoardAction({
        title,
        content: sanitizedContent,
        categoryId: category,
        isNotice: session.user.role === "SUPERMASTER" ? isNotice : false,
      });

      if (result.success) {
        toast({
          title: "게시글이 성공적으로 작성되었습니다.",
        });
        router.push(`/board/${result.data?.id}`);
      } else {
        toast({
          title: "게시글 작성 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "게시글 작성 실패",
        description:
          (error as Error)?.message || "잠시 후에 다시 시도해주세요.",
        variant: "destructive",
      });
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
          <div className="block sm:hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <Link
                href="/boards"
                className="flex items-center gap-2 text-muted-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>돌아가기</span>
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                  임시저장
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? "작성 중..." : "작성"}
                </Button>
              </div>
            </div>
            <div className="px-4 py-3 flex flex-col gap-3">
              <Input
                type="text"
                value={title}
                autoFocus
                minLength={5}
                maxLength={30}
                className="text-lg"
                placeholder="제목을 입력해주세요"
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <Select value={category} onValueChange={handleCategoryChange}>
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
                <MarkdownConverterDialog onConvert={handleMarkdownConvert} />
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
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center justify-between p-4 h-16">
              <Link
                href="/boards"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>돌아가기</span>
              </Link>

              <div className="flex items-center gap-4">
                <Select value={category} onValueChange={handleCategoryChange}>
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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDraftList(true)}
                  >
                    임시저장 목록
                  </Button>
                  <Button variant="outline" onClick={handleSaveDraft}>
                    임시저장
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "작성 중..." : "작성"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="hidden sm:block mb-4">
            <Input
              type="text"
              value={title}
              autoFocus
              minLength={5}
              maxLength={30}
              className="font-medium border-0 px-0 focus-visible:ring-0 text-2xl"
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

      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>임시 저장된 내용이 있습니다</AlertDialogTitle>
            <AlertDialogDescription>
              이전에 작성 중이던 내용을 불러오시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={handleIgnoreDraft}
              className="mt-2 sm:mt-0"
            >
              무시하기
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLoadDraft}
              className="mt-2 sm:mt-0"
            >
              불러오기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <Dialog open={showDraftList} onOpenChange={setShowDraftList}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>임시저장 목록</DialogTitle>
            <DialogDescription>
              저장된 글 목록입니다. 클릭하여 불러올 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DraftList
            onSelect={handleSelectDraft}
            onDelete={handleDeleteDraft}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
