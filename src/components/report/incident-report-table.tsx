"use client";

import { IncidentReport } from "@/types/report";
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
import { useMemo, useState, useCallback, Fragment } from "react";
import { useSession } from "next-auth/react";
import { formatKoreanDateTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface IncidentReportTableProps {
  data: {
    records: IncidentReport[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export default function IncidentReportTable({
  data,
}: IncidentReportTableProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const columns: ColumnDef<IncidentReport>[] = useMemo(
    () => [
      {
        header: "보고서 ID",
        accessorKey: "report_id",
        cell: ({ row }) => row.original.report_id,
      },
      {
        header: "처벌 유형",
        accessorKey: "penalty_type",
      },
      {
        header: "사유",
        accessorKey: "reason",
        cell: ({ row }) => row.original.reason,
      },
      {
        header: "대상자",
        accessorKey: "target_user_nickname",
        cell: ({ row }) => (
          <div>
            {row.original.target_user_nickname} ({row.original.target_user_id})
          </div>
        ),
      },
      {
        header: "신고자",
        accessorKey: "reporting_user_nickname",
        cell: ({ row }) => (
          <div>
            {row.original.reporting_user_nickname} (
            {row.original.reporting_user_id})
          </div>
        ),
      },
      {
        header: "처리자",
        accessorKey: "admin",
      },
      {
        header: "처리 일시",
        accessorKey: "incident_time",
        cell: ({ row }) => formatKoreanDateTime(row.original.incident_time),
      },
      ...(session?.user?.role === "SUPERMASTER"
        ? [
            {
              id: "actions",
              header: "관리",
              cell: ({ row }: { row: Row<IncidentReport> }) => {
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          // TODO: 수정 다이얼로그 열기
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>수정</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          if (confirm("정말로 이 보고서를 삭제하시겠습니까?")) {
                            // TODO: 삭제 API 연동
                          }
                        }}
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
          ]
        : []),
    ],
    [session]
  );

  const table = useReactTable({
    data: data.records || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

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
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => row.toggleExpanded()}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="bg-muted/30">
                    <div className="p-2 grid gap-2">
                      <p className="text-lg font-bold">상세 내용</p>
                      <p className="text-sm whitespace-pre-wrap">
                        {row.original.incident_description}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          총 {data.total}개 중 {(data.page - 1) * 10 + 1}-
          {Math.min(data.page * 10, data.total)}개 표시
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
