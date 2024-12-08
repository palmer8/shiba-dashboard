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
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { formatKoreanDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useMemo } from "react";

interface BoardData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  isNotice: boolean;
  registrant: {
    id: string;
    nickname: string;
  };
  category: {
    id: string;
    name: string;
  };
  commentCount: number;
}

interface BoardMetadata {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

interface BoardTableProps {
  data: BoardData[];
  notices: BoardData[];
  metadata: BoardMetadata;
  page: number;
}

export function BoardTable({ data, notices, metadata, page }: BoardTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const columns: ColumnDef<BoardData>[] = [
    {
      accessorKey: "title",
      header: "제목",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isNotice && <Badge variant="secondary">공지</Badge>}
          <Link href={`/board/${row.original.id}`} className="hover:underline">
            {row.original.title}
            {row.original.commentCount > 0 && (
              <span className="text-sm text-muted-foreground ml-1">
                [{row.original.commentCount}]
              </span>
            )}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "category.name",
      header: "카테고리",
    },
    {
      accessorKey: "registrant.nickname",
      header: "작성자",
    },
    {
      accessorKey: "views",
      header: "조회수",
      cell: ({ row }) => row.original.views.toLocaleString() + "회",
    },
    {
      accessorKey: "createdAt",
      header: "작성일",
      cell: ({ row }) => formatKoreanDateTime(row.original.createdAt),
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
            onClick={() => router.push("/boards/write")}
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

  return (
    <div className="space-y-4">
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
              <TableRow key={row.id}>
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
    </div>
  );
}
