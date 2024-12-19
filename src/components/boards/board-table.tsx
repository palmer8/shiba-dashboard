"use client";

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
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  formatKoreanDateTime,
  handleDownloadJson2CSV,
  hasAccess,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash, Eye, Heart } from "lucide-react";
import {
  deleteBoardAction,
  getBoardListsByIdsOriginAction,
} from "@/actions/board-action";
import { toast } from "@/hooks/use-toast";
import { BoardData, BoardList } from "@/types/board";
import { checkPermission } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRole } from "@prisma/client";
import { Session } from "next-auth";
import Link from "next/link";

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
  const searchParams = useSearchParams();

  const columns: ColumnDef<BoardData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "제목",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isNotice && <Badge variant="secondary">공지</Badge>}
          {row.original.title}
          {row.original.commentCount > 0 && (
            <span className="text-sm text-muted-foreground">
              [{row.original.commentCount}]
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category.name",
      header: "카테고리",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.category.name}
        </span>
      ),
    },
    {
      accessorKey: "registrant.nickname",
      header: "작성자",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.registrant.nickname}</span>
      ),
    },
    {
      accessorKey: "views",
      header: () => (
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>조회</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.views.toLocaleString()}회
        </span>
      ),
    },
    {
      accessorKey: "_count.likes",
      header: () => (
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          <span>좋아요</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original._count.likes.toLocaleString()}명
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "작성일",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatKoreanDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row<BoardData> }) => {
        const hasPermission = checkPermission(
          session.user?.id,
          row.original.registrant.id,
          session.user?.role
        );

        if (!hasPermission) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/board/${row.original.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span>수정</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original.id)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>삭제</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const memorizedData = useMemo(
    () => [...(notices || []), ...(data || [])],
    [notices, data]
  );

  if (!data || (!data?.length && !notices?.length)) {
    return (
      <div className="rounded-md border border-dashed p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">게시글이 없습니다.</p>
          <Button
            variant="link"
            onClick={() => router.push("/board/write")}
            className="mt-2"
          >
            첫 게시글을 작성해보세요
          </Button>
        </div>
      </div>
    );
  }

  const table = useReactTable({
    data: memorizedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/boards?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      const result = await deleteBoardAction(id);
      if (result.success) {
        toast({
          title: "게시글이 삭제되었습니다.",
        });
      } else {
        toast({
          title: "게시글 삭제에 실패했습니다.",
          description: result.error || "잠시 후에 다시 시도해주세요",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownload = async () => {
    const result = await getBoardListsByIdsOriginAction(
      table.getSelectedRowModel().rows.map((row) => row.original.id)
    );
    if (result.success) {
      handleDownloadJson2CSV({
        data: result.data || [],
        fileName: `${formatKoreanDateTime(new Date())}_boards`,
      });
      toast({
        title: "게시글 목록 CSV 파일을 다운로드하였습니다.",
      });
    } else {
      toast({
        title: "게시글 목록 CSV 파일 다운로드에 실패했습니다.",
        description: result.error || "잠시 후에 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex justify-end items-center gap-2">
        {hasAccess(session?.user?.role, UserRole.MASTER) && (
          <Button
            disabled={!table.getSelectedRowModel().rows.length}
            size="sm"
            onClick={handleDownload}
          >
            CSV 다운로드
          </Button>
        )}
        <Button size="sm" asChild>
          <Link href="/board/write">글쓰기</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="cursor-pointer"
                key={row.id}
                onClick={() => router.push(`/board/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {memorizedData.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            총 {metadata.totalCount.toLocaleString()}개 중 {(page - 1) * 50 + 1}
            -{Math.min(page * 50, metadata.totalCount)}개 표시
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              이전
            </Button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={page}
                onChange={(e) => {
                  const newPage = parseInt(e.target.value);
                  if (newPage >= 1 && newPage <= metadata.totalPages) {
                    handlePageChange(newPage);
                  }
                }}
                className="w-12 rounded-md border border-input bg-background px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={1}
                max={metadata.totalPages}
              />
              <span className="text-sm text-muted-foreground">
                / {metadata.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= metadata.totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
