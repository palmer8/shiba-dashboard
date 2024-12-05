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
import { BoardData } from "@/types/board";

interface BoardTableProps {
  // data: {
  //   data: BoardData[];
  //   notices: BoardData[];
  //   metadata: {
  //     currentPage: number;
  //     totalPages: number;
  //     totalCount: number;
  //   };
  // };
  data: any;
  page: number;
}

export function BoardTable({ data, page }: BoardTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const columns: ColumnDef<BoardData>[] = [
    {
      accessorKey: "title",
      header: "제목",
      cell: ({ row }) => (
        <Link
          href={`/boards/${row.original.id}`}
          className="hover:underline flex items-center gap-2"
        >
          {row.original.isNotice && <Badge variant="secondary">공지</Badge>}
          {row.original.title}
          {row.original.commentCount > 0 && (
            <span className="text-sm text-muted-foreground">
              [{row.original.commentCount}]
            </span>
          )}
        </Link>
      ),
    },
    {
      accessorKey: "regis.nickname",
      header: "작성자",
      cell: ({ row }) => row.original.regis.nickname,
    },
    {
      accessorKey: "views",
      header: "조회수",
      cell: ({ row }) => row.original.views.toLocaleString(),
    },
    {
      accessorKey: "createdAt",
      header: "작성일",
      cell: ({ row }) => formatKoreanDateTime(row.original.createdAt),
    },
  ];

  const table = useReactTable({
    data: [...data.notices, ...data.data],
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          총 {data.metadata.totalCount.toLocaleString()}개 중{" "}
          {(page - 1) * 50 + 1}-{Math.min(page * 50, data.metadata.totalCount)}
          개 표시
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
                if (newPage >= 1 && newPage <= data.metadata.totalPages) {
                  handlePageChange(newPage);
                }
              }}
              className="w-12 rounded-md border border-input bg-background px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
              max={data.metadata.totalPages}
            />
            <span className="text-sm text-muted-foreground">
              / {data.metadata.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= data.metadata.totalPages}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
