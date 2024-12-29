"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatKoreanDateTime, handleDownloadJson2CSV } from "@/lib/utils";
import {
  MoreHorizontal,
  Heart,
  MessageSquare,
  Eye,
  Download,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BoardData, BoardList } from "@/types/board";
import { Session } from "next-auth";
import {
  deleteBoardAction,
  getBoardListsByIdsOriginAction,
} from "@/actions/board-action";
import { toast } from "@/hooks/use-toast";

interface BoardTableProps {
  data: BoardData[];
  notices: BoardData[];
  metadata: BoardList["metadata"];
  page: number;
  session: Session;
}

export function BoardTable({
  data,
  notices,
  metadata,
  page,
  session,
}: BoardTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows((prev) =>
      prev.length === data.length ? [] : data.map((board) => board.id)
    );
  };

  const handleDownload = async () => {
    if (selectedRows.length === 0) return;
    const result = await getBoardListsByIdsOriginAction(selectedRows);

    if (result.success && result.data) {
      handleDownloadJson2CSV({
        data: result.data,
        fileName: "게시글목록",
      });
      toast({
        title: "CSV 다운로드 성공",
      });
    } else {
      toast({
        title: "CSV 다운로드 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteBoardAction(id);
    if (result.success) {
      toast({
        title: "게시글 삭제 성공",
      });
      router.refresh();
    } else {
      toast({
        title: "게시글 삭제 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  const renderBoardCard = (
    board: BoardData,
    index: number,
    isNotice: boolean = false
  ) => (
    <Card
      onClick={() => router.push(`/board/${board.id}`)}
      key={board.id}
      className="hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {session?.user?.role === UserRole.SUPERMASTER && (
            <Checkbox
              checked={selectedRows.includes(board.id)}
              onCheckedChange={() => handleSelect(board.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isNotice && <Badge variant="secondary">공지</Badge>}
              <Badge variant="outline">{board.category.name}</Badge>
              <span className="text-sm text-muted-foreground">
                #{metadata.totalCount - ((page - 1) * 50 + index)}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/board/${board.id}`} className="hover:underline">
                  <h3 className="font-medium line-clamp-2">{board.title}</h3>
                </Link>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={board.registrant.image || ""} />
                      <AvatarFallback>
                        {board.registrant.nickname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{board.registrant.nickname}</span>
                  </div>
                  <span>{formatKoreanDateTime(new Date(board.createdAt))}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{board.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{board.commentCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{board._count.likes}</span>
                </div>

                {(session?.user?.id === board.registrant.id ||
                  session?.user?.role === UserRole.SUPERMASTER) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/board/${board.id}/edit`)}
                      >
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(board.id)}
                        className="text-destructive"
                      >
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {session?.user?.role === UserRole.SUPERMASTER && data.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedRows.length === data.length}
              onCheckedChange={handleSelectAll}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={selectedRows.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV 다운로드
            </Button>
          </div>
        )}
        <Button size="sm" asChild className="ml-auto">
          <Link href="/board/write">글쓰기</Link>
        </Button>
      </div>

      {notices.length > 0 && (
        <div className="space-y-2">
          {notices.map((notice, i) => renderBoardCard(notice, i, true))}
        </div>
      )}

      <div className="space-y-2">
        {data.map((board, i) => renderBoardCard(board, i))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/boards?page=${metadata.currentPage - 1}`)
          }
          disabled={metadata.currentPage <= 1}
        >
          이전
        </Button>
        <span className="text-sm">
          {metadata.currentPage} / {metadata.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/boards?page=${metadata.currentPage + 1}`)
          }
          disabled={metadata.currentPage >= metadata.totalPages}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
