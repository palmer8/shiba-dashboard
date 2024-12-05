"use client";

import { JSONContent } from "novel";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const BoardWriteForm = () => {
  const [content, setContent] = useState<JSONContent>({});
  const [title, setTitle] = useState("");

  return (
    <div className="w-full h-full">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between">
        <Link
          href="/boards"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>돌아가기</span>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline">임시저장</Button>
          <Button>작성완료</Button>
        </div>
      </div>

      {/* 메인 에디터 영역 */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <Input
            type="text"
            min={5}
            max={30}
            value={title}
            autoFocus
            className="py-6 border-0 border-b rounded-none focus-visible:ring-0 px-0 text-lg"
            placeholder="제목을 입력해주세요."
            onChange={(e) => setTitle(e.target.value)}
          />
        </CardHeader>
        <CardContent className="px-0">
          <div className="min-h-[600px]"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoardWriteForm;
