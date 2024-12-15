"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { JSONContent } from "novel";
import { convertMarkdownToNovel } from "@/lib/utils";
import Editor from "@/components/editor/advanced-editor";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { MarkdownNode } from "@/types/lib";

interface MarkdownConverterDialogProps {
  onConvert: (content: JSONContent) => void;
}

export function MarkdownConverterDialog({
  onConvert,
}: MarkdownConverterDialogProps) {
  const [open, setOpen] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [previewContent, setPreviewContent] = useState<JSONContent>({
    type: "doc",
    content: [],
  });
  const [previewKey, setPreviewKey] = useState(0); // Editor 리렌더링을 위한 key 추가

  const handlePreview = () => {
    try {
      const processor = unified().use(remarkParse).use(remarkGfm);

      const tree = processor.parse(markdown);

      let content: JSONContent = {
        type: "doc",
        content: convertMarkdownToNovel(tree.children as MarkdownNode[]),
      };

      setPreviewContent(content);
      setPreviewKey((prev) => prev + 1);

      toast({
        title: "미리보기 생성 완료",
      });
    } catch (error) {
      console.error("Markdown conversion error:", error);
      toast({
        title: "변환 실패",
        description: "마크다운 변환 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleApply = () => {
    if (previewContent.content?.length === 0) {
      toast({
        title: "변환 필요",
        description: "먼저 미리보기를 생성해주세요.",
        variant: "destructive",
      });
      return;
    }

    onConvert(previewContent);
    setOpen(false);
    setMarkdown("");
    setPreviewContent({ type: "doc", content: [] });
    setPreviewKey(0);

    toast({
      title: "변환 완료",
      description: "변환된 내용이 에디터에 적용되었습니다.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">마크다운 변환</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>마크다운 변환</DialogTitle>
          <DialogDescription>
            입력한 마크다운 컨텐츠를 변환하여 현재 게시글에 붙여넣습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">마크다운 입력</label>
            <Textarea
              placeholder="마크다운 텍스트를 입력하세요..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="h-[400px] font-mono"
            />
            <Button onClick={handlePreview}>미리보기</Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">변환 미리보기</label>
            <div className="h-[400px] overflow-auto">
              <Editor
                key={previewKey}
                initialValue={previewContent}
                // editable={false}
                onChange={(content) => console.log(content)}
                markdown={true}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleApply}>적용하기</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
