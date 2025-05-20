"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminLog, AdminLogListResponse } from "@/types/log";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useEffect, useState, useRef } from "react";
import Empty from "@/components/ui/empty";
import { formatKoreanDateTime, handleDownloadJson2CSV } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { getAccountUsingLogsByIdsAction } from "@/actions/log-action";
import { toast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

interface AdminLogTableProps {
  data: AdminLogListResponse;
}

export default function AdminLogTable({ data }: AdminLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(data.page.toString());
  const tableContainerRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    setInputPage(data.page.toString());
  }, [data.page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [data.page]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const columns: ColumnDef<AdminLog>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "id",
        accessorKey: "id",
      },
      {
        header: "메시지",
        accessorKey: "message",
        cell: ({ row }) => <span>{row.original.content || "정보없음"}</span>,
      },
      {
        header: "등록자",
        accessorKey: "registrantId",
        cell: ({ row }) => (
          <span>
            {row.original.registrantNickname} ({row.original.registrantUserId})
          </span>
        ),
      },
      {
        header: "생성일자",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <span>
            {row.original.createdAt
              ? formatKoreanDateTime(row.original.createdAt)
              : "정보없음"}
          </span>
        ),
      },
    ],
    [router]
  );

  const memorizedData = useMemo(() => data.records, [data.records]);

  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    columns,
    data: memorizedData,
    state: {
      columnVisibility: {
        id: false,
      },
    },
  });

  const handleCSVDownload = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const result = await getAccountUsingLogsByIdsAction(
      selectedRows.map((row) => row.original.id)
    );
    if (result.success) {
      handleDownloadJson2CSV({
        data: result.data || [],
        fileName: `account_using_logs.csv`,
      });
      toast({
        title: "CSV 다운로드 성공",
      });
    } else {
      toast({
        title: "CSV 다운로드 실패",
        description: result.error || "잠시 후에 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2">
        <Button
          disabled={table.getSelectedRowModel().rows.length === 0}
          onClick={handleCSVDownload}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          CSV 다운로드
        </Button>
      </div>
      <Table ref={tableContainerRef}>
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
          {table.getRowModel().rows.length > 0 ? (
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
                <Empty description="데이터가 존재하지 않습니다." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center gap-2 justify-end">
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
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onBlur={(e) => {
              let newPage = parseInt(e.target.value);
              if (isNaN(newPage) || newPage < 1) {
                newPage = 1;
                setInputPage("1");
              } else if (newPage > data.totalPages) {
                newPage = data.totalPages;
                setInputPage(data.totalPages.toString());
              }
              handlePageChange(newPage);
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
  );
}
