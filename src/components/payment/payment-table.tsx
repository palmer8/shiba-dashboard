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
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { formatKoreanDateTime } from "@/lib/utils";

interface PaymentTableProps {
  data: {
    items: unknown[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export default function PaymentTable({ data }: PaymentTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = useMemo<ColumnDef<unknown>[]>(
    () => [
      {
        accessorKey: "transid",
        header: "거래번호",
        cell: ({ row }) => (
          <div className="font-mono">{row.getValue("transid")}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "이메일",
      },
      {
        accessorKey: "ip",
        header: "IP",
      },
      {
        accessorKey: "price",
        header: "결제금액",
        cell: ({ row }) => (
          <div className="text-right">
            ${row.getValue("price")?.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "결제일시",
        cell: ({ row }) => formatKoreanDateTime(row.getValue("date")),
      },
    ],
    []
  );

  const table = useReactTable({
    data: data.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
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
                데이터가 존재하지 않습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          총 {data.total}개 중 {(data.page - 1) * 50 + 1}-
          {Math.min(data.page * 50, data.total)}개 표시
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.page - 1)}
            disabled={data.page <= 1}
          >
            이전
          </Button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={data.page}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page > 0 && page <= data.totalPages) {
                  handlePageChange(page);
                }
              }}
              className="w-12 rounded-md border border-input bg-background px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
              max={data.totalPages}
            />
            <span className="text-sm text-muted-foreground">
              / {data.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.page + 1)}
            disabled={data.page >= data.totalPages}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
