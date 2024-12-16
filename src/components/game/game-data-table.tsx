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
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GameDataType } from "@/types/game";
import {
  formatAmount,
  formatGameDataType,
  formatKoreanDateTime,
  formatKoreanNumber,
  handleDownloadJson2CSV,
} from "@/lib/utils";
import { downloadCSV } from "@/lib/utils";

interface GameDataTableProps {
  data: any;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  type: GameDataType;
  queryType: GameDataType;
}

export function GameDataTable({
  data,
  currentPage,
  totalPages,
  onPageChange,
  type,
  queryType,
}: GameDataTableProps) {
  const columns: ColumnDef<any>[] = [
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
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      id: "no",
      header: "No.",
      cell: ({ row }) => row.index + 1 + (currentPage - 1) * 50,
    },
    {
      header: "유저",
      accessorKey: "user",
      cell: ({ row }) => (
        <span>
          {row.original.nickname} ({row.original.id})
        </span>
      ),
    },
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "닉네임",
      accessorKey: "nickname",
    },
    {
      header: "가입일",
      accessorKey: "first_join",
      cell: ({ row }) => formatKoreanDateTime(row.original.first_join),
    },
    {
      header: "조회 유형",
      accessorKey: "type",
      cell: ({ row }) => formatGameDataType(row.original.type),
    },
    {
      header: "조회 결과",
      accessorKey: "amount",
      cell: ({ row }) => {
        if (queryType === "REGISTRATION") {
          return "보유";
        }
        if (["ITEM", "CREDIT", "CREDIT2"].includes(queryType)) {
          return `${formatKoreanNumber(row.original.amount)}개`;
        }
        return `${formatKoreanNumber(row.original.amount)}원`;
      },
    },
  ];

  const tableData = useMemo(() => data?.data || [], [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: {
        id: false,
        nickname: false,
      },
    },
  });

  const handleDownloadCSV = useCallback(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const csvData = selectedRows.map((row) => row.original);
    handleDownloadJson2CSV({
      data: csvData,
      fileName: `${formatKoreanDateTime(new Date())}-game-data.csv`,
    });
  }, [table]);

  if (tableData.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">조회 결과</h2>
        <Button
          disabled={table.getSelectedRowModel().rows.length === 0}
          onClick={handleDownloadCSV}
        >
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
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          이전
        </Button>
        <span className="flex items-center px-2 text-sm text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
