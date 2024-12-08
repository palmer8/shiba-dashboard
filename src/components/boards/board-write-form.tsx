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

interface Category {
  id: string;
  name: string;
  template: JSONContent | null;
}

const DRAFT_COOKIE_KEY = "board_draft";

function BoardWriteForm() {
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

  const handleCategoryChange = (value: string) => {
    setCategory(value);

    const selectedCategory = categories.find((cat) => cat.id === value);

    if (selectedCategory?.template) {
      setContent(selectedCategory.template as JSONContent);
      setEditorKey((prev) => prev + 1);
    } else {
      setContent(DEFAULT_EDITOR_CONTENT);
      setEditorKey((prev) => prev + 1);
    }
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
    const draftData = {
      title,
      content,
      category,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_COOKIE_KEY, JSON.stringify(draftData));
    toast({
      title: "임시 저장 완료",
      description: "작성 중인 내용이 저장되었습니다.",
    });
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem(DRAFT_COOKIE_KEY);
    if (draft) {
      const draftData = JSON.parse(draft);
      setTitle(draftData.title);
      setContent(draftData.content);
      setCategory(draftData.category);
      setEditorKey((prev) => prev + 1);
    }
    setShowDraftDialog(false);
  };

  const handleIgnoreDraft = () => {
    localStorage.removeItem(DRAFT_COOKIE_KEY);
    setShowDraftDialog(false);
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast({
        title: "오류가 발생했습니다.",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "오류가 발생했습니다.",
        description: "제목을 알맞게 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "오류가 발생했습니다.",
        description: "카테고리를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createBoardAction({
        title,
        content,
        categoryId: category,
      });

      if (result.success) {
        toast({
          title: "성공적으로 게시글이 작성되었습니다 ",
        });
        router.push("/boards");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "오류가 발생했습니다.",
        description: "게시글 작성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-[1200px] w-full h-full mx-auto">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between h-16 px-4">
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
              <div className="flex gap-2">
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

        <div className="max-w-[900px] mx-auto px-4 py-6">
          <Input
            type="text"
            value={title}
            autoFocus
            minLength={5}
            maxLength={30}
            className="font-medium border-0 px-0 focus-visible:ring-0 mb-4 md:text-2xl"
            placeholder="제목을 입력해주세요"
            onChange={(e) => setTitle(e.target.value)}
          />
          <Editor
            key={editorKey}
            initialValue={content}
            onChange={(value) => setContent(value)}
            immediatelyRender={false}
          />
        </div>
      </div>

      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>임시 저장된 내용이 있습니다</AlertDialogTitle>
            <AlertDialogDescription>
              이전에 작성 중이던 내용을 불러오시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleIgnoreDraft}>
              무시하기
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLoadDraft}>
              불러오기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default BoardWriteForm;
