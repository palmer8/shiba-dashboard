"use client";

import { BoardCategory } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowLeft, Trash2 } from "lucide-react";
import { JSONContent } from "novel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarkdownConverterDialog } from "@/components/dialog/markdown-converter-dialog";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useEffect, useCallback, useState } from "react";
import { DEFAULT_EDITOR_CONTENT } from "@/constant/constant";

interface Draft {
  id: string;
  title: string;
  content: JSONContent;
  category: string;
  lastSaved: string;
}

interface CommonFormLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitText: string;
  backHref: string;
  title: string;
  setTitle: (value: string) => void;
  category: string;
  onCategoryChange: (isTemplate: boolean, value: string) => void;
  categories: BoardCategory[];
  isNotice?: boolean;
  onNoticeChange?: (checked: boolean) => void;
  showNoticeOption?: boolean;
  onMarkdownConvert: (content: JSONContent) => void;
  onDraftSelect: (draft: Draft) => void;
  content: JSONContent;
  setContent: (content: JSONContent) => void; // 추가된 prop
  canSaveDraft?: boolean; // 추가된 prop
}

export function CommonFormLayout({
  children,
  onBack,
  onSubmit,
  isSubmitting,
  submitText,
  backHref,
  title,
  setTitle,
  category,
  onCategoryChange,
  categories,
  isNotice,
  onNoticeChange,
  showNoticeOption,
  onMarkdownConvert,
  onDraftSelect,
  content,
  setContent,
  canSaveDraft = false, // 기본값 설정
}: CommonFormLayoutProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<{
    id: string;
    template: JSONContent;
  } | null>(null);

  const DRAFT_STORAGE_KEY = "drafts";

  // 드래프트 저장 함수 (수동 저장)
  const saveDraft = useCallback(() => {
    if (!title.trim() && !content) return;

    const draft = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim() || "제목 없음",
      content,
      category,
      lastSaved: new Date().toISOString(),
    };

    const currentDrafts = loadDrafts();
    const updatedDrafts = [draft, ...currentDrafts];
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    toast({ title: "임시 저장 완료" });
  }, [title, content, category]);

  // 드래프트 목록 불러오기
  const loadDrafts = useCallback((): Draft[] => {
    try {
      const draftsData = localStorage.getItem(DRAFT_STORAGE_KEY);
      const drafts = draftsData ? JSON.parse(draftsData) : [];
      // 날짜 기준 내림차순 정렬 추가
      return drafts.sort(
        (a: Draft, b: Draft) =>
          new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime()
      );
    } catch (e) {
      console.error("Draft load error:", e);
      return [];
    }
  }, []);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, [loadDrafts]);

  // 드래프트 선택 핸들러
  const handleSelectDraft = (draft: Draft) => {
    onDraftSelect(draft);
    // 다이얼로그 자동 닫힘
  };

  // 드래프트 삭제 핸들러
  const handleDeleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter((draft) => draft.id !== id);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    toast({ title: "임시 저장 삭제 완료" });
  };

  // 카테고리 변경 핸들러 (템플릿 적용 여부 확인)
  const handleCategoryChangeInternal = (value: string) => {
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
      setPendingCategory({
        id: value,
        template: selectedCategory.template as JSONContent,
      });
      setShowTemplateDialog(true);
    } else {
      onCategoryChange(false, value);
    }
  };

  // 템플릿 적용 핸들러
  const handleApplyTemplate = () => {
    if (pendingCategory) {
      onCategoryChange(true, pendingCategory.id);
      setContent(pendingCategory.template);
    }
    setShowTemplateDialog(false);
    setPendingCategory(null);
  };

  // 템플릿 무시 핸들러
  const handleIgnoreTemplate = () => {
    if (pendingCategory) {
      onCategoryChange(false, pendingCategory.id);
    }
    setShowTemplateDialog(false);
    setPendingCategory(null);
  };

  return (
    <div className="w-full h-full mx-auto max-w-[1200px]">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        {/* 모바일 헤더 */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>돌아가기</span>
            </Link>
            <div className="flex items-center gap-2">
              {canSaveDraft && (
                <Button
                  variant="outline"
                  onClick={saveDraft}
                  disabled={isSubmitting}
                  size="sm"
                >
                  임시 저장
                </Button>
              )}
              <Button onClick={onSubmit} disabled={isSubmitting} size="sm">
                {isSubmitting ? `${submitText} 중...` : submitText}
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
              className="text-2xl"
              placeholder="제목을 입력해주세요"
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Select
                value={category}
                onValueChange={handleCategoryChangeInternal}
              >
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
              {showNoticeOption && onNoticeChange && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isNotice-mobile"
                    checked={isNotice}
                    onCheckedChange={(checked) =>
                      onNoticeChange(checked as boolean)
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
              <MarkdownConverterDialog onConvert={onMarkdownConvert} />
            </div>
          </div>
        </div>

        {/* 데스크톱 헤더 */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between p-4 h-16">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>돌아가기</span>
            </Link>
            <div className="flex items-center gap-4">
              <Select
                value={category}
                onValueChange={handleCategoryChangeInternal}
              >
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
              {showNoticeOption && onNoticeChange && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isNotice"
                    checked={isNotice}
                    onCheckedChange={(checked) =>
                      onNoticeChange(checked as boolean)
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
              <MarkdownConverterDialog onConvert={onMarkdownConvert} />
              <div className="flex items-center gap-2">
                {canSaveDraft && (
                  <Button
                    variant="outline"
                    onClick={saveDraft}
                    disabled={isSubmitting}
                  >
                    임시 저장
                  </Button>
                )}
                <Button onClick={onSubmit} disabled={isSubmitting}>
                  {isSubmitting ? `${submitText} 중...` : submitText}
                </Button>
              </div>
              {/* 임시 저장 목록 버튼 */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">임시 저장 목록</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>임시 저장된 글 목록</DialogTitle>
                    <DialogDescription>
                      저장된 임시 글을 선택하거나 삭제할 수 있습니다.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {drafts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          임시저장된 글이 없습니다.
                        </div>
                      ) : (
                        drafts.map((draft) => (
                          <div
                            key={draft.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <button
                              onClick={() => handleSelectDraft(draft)}
                              className="flex-1 text-left"
                            >
                              <h4 className="font-medium truncate">
                                {draft.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {format(
                                  new Date(draft.lastSaved),
                                  "yyyy.MM.dd HH:mm"
                                )}
                              </p>
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDraft(draft.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">닫기</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
        {children}
      </div>

      {/* 템플릿 적용 AlertDialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>템플릿 적용</DialogTitle>
            <DialogDescription>
              이 카테고리에는 템플릿이 있습니다. 템플릿을 적용하시겠습니까?
              {content !== DEFAULT_EDITOR_CONTENT && (
                <span className="block mt-2 text-destructive">
                  ※ 주의: 템플릿을 적용하면 현재 작성 중인 내용이 삭제됩니다.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={handleIgnoreTemplate}>
                템플릿 무시
              </Button>
            </DialogClose>
            <Button onClick={handleApplyTemplate}>템플릿 적용</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
