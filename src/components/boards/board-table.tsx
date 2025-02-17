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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import Empty from "@/components/ui/empty";

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
    } else {
      toast({
        title: "게시글 삭제 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<BoardData>[] = [
    {
      id: "select",
      header: ({ table }) =>
        session?.user?.role === UserRole.SUPERMASTER && (
          <Checkbox
            checked={selectedRows.length === data.length}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
          />
        ),
      cell: ({ row }) =>
        session?.user?.role === UserRole.SUPERMASTER && (
          <Checkbox
            checked={selectedRows.includes(row.original.id)}
            onCheckedChange={() => handleSelect(row.original.id)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
    },
    {
      accessorKey: "category",
      header: "카테고리",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.isNotice && <Badge variant="secondary">공지</Badge>}
          <Badge variant="outline">{row.original.category.name}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "제목",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "registrant",
      header: "작성자",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={row.original.registrant.image || ""} />
            <AvatarFallback>
              {row.original.registrant.nickname[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{row.original.registrant.nickname}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "작성일",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatKoreanDateTime(new Date(row.original.createdAt))}
        </span>
      ),
    },
    {
      accessorKey: "views",
      header: () => <div className="text-center">조회</div>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-muted-foreground">
          {row.original.views}
        </div>
      ),
    },
    {
      accessorKey: "comments",
      header: () => <div className="text-center">댓글</div>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-muted-foreground">
          {row.original._count.comments}
        </div>
      ),
    },
    {
      accessorKey: "likes",
      header: () => <div className="text-center">좋아요</div>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-muted-foreground">
          {row.original._count.likes}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        (session?.user?.id === row.original.registrant.id ||
          session?.user?.role === UserRole.SUPERMASTER) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/board/${row.original.id}/edit`)}
              >
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original.id)}
                className="text-destructive"
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ];

  const table = useReactTable({
    data: [...notices, ...data],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {table
                .getHeaderGroups()
                .map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))
                )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    row.original.isNotice && "bg-muted/30"
                  )}
                  onClick={() => router.push(`/board/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Empty description="게시글이 없습니다." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-auto pt-4">
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
            {metadata.currentPage} / {metadata.totalPages || 1}
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
      )}
    </div>
  );
}
