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
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import Empty from "@/components/ui/empty";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatKoreanDateTime, handleDownloadJson2CSV } from "@/lib/utils";
import { InstagramResult } from "@/types/game";
import { Checkbox } from "@/components/ui/checkbox";

interface InstagramTableProps {
  data: {
    records: InstagramResult[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
}

export function InstagramTable({ data }: InstagramTableProps) {
  const columns: ColumnDef<InstagramResult>[] = [
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
      id: "no",
      header: "No.",
      cell: ({ row }) => row.index + 1 + (data.metadata.page - 1) * 50,
    },
    {
      header: "닉네임",
      accessorKey: "nickname",
      cell: ({ row }) => `${row.getValue("nickname")} (${row.original.id})`,
    },
    {
      header: "최초 접속일",
      accessorKey: "first_join",
      cell: ({ row }) => formatKoreanDateTime(row.getValue("first_join")),
    },
    {
      header: "인스타 이름",
      accessorKey: "display_name",
    },
    {
      header: "인스타 계정",
      accessorKey: "username",
    },
    {
      header: "전화번호",
      accessorKey: "phone_number",
    },
    {
      header: "가입일",
      accessorKey: "date_joined",
      cell: ({ row }) => formatKoreanDateTime(row.getValue("date_joined")),
    },
  ];

  const table = useReactTable({
    data: data.records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    window.location.href = `?${params.toString()}`;
  }, []);

  const handleDownloadCSV = async () => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    handleDownloadJson2CSV({
      data: selectedRows,
      fileName: "instagram_accounts",
    });
    toast({ title: "CSV 다운로드 성공" });
  };

  if (data.records.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Empty description="데이터가 존재하지 않습니다." />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">조회 결과</h2>
        <Button
          disabled={!table.getSelectedRowModel().rows.length}
          variant="outline"
          size="sm"
          onClick={handleDownloadCSV}
        >
          <Download className="h-4 w-4 mr-2" />
          CSV 다운로드
        </Button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
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
          총 {data.metadata.total}개 중 {(data.metadata.page - 1) * 50 + 1}-
          {Math.min(data.metadata.page * 50, data.metadata.total)}개 표시
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.metadata.page - 1)}
            disabled={data.metadata.page <= 1}
          >
            이전
          </Button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={data.metadata.page}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page > 0 && page <= data.metadata.totalPages) {
                  handlePageChange(page);
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
            onClick={() => handlePageChange(data.metadata.page + 1)}
            disabled={data.metadata.page >= data.metadata.totalPages}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
