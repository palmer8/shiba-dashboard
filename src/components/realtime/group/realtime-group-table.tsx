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
import { Fragment, useMemo, useState } from "react";
import { RealtimeGroupExpandedRow } from "./realtime-group-expanded-row";
import { RealtimeGroupData } from "@/types/user";
import {
  formatKoreanDateTime,
  handleDownloadJson2CSV,
  parseTimeString,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

interface RealtimeGroupTableProps {
  data: {
    users: RealtimeGroupData[];
    count: number;
    nextCursor?: number;
  };
  groupName: string;
}

export default function RealtimeGroupTable({
  data,
  groupName,
}: RealtimeGroupTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cursorHistory, setCursorHistory] = useState<number[]>([0]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const columns = useMemo<ColumnDef<RealtimeGroupData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
      },
      {
        accessorKey: "user_id",
        header: "고유번호",
        cell: ({ row }) => <div>{row.getValue("user_id")}</div>,
      },
      {
        accessorKey: "name",
        header: "닉네임",
      },
      {
        accessorKey: "job",
        header: "직업",
      },
      {
        accessorKey: "lastLogin",
        header: "최종 접속",
        cell: ({ row }) => {
          const lastLogin = row.getValue("lastLogin");
          return lastLogin ? (
            <div>
              {formatKoreanDateTime(parseTimeString(lastLogin as string))}
            </div>
          ) : (
            <div className="text-muted-foreground">기록 없음</div>
          );
        },
      },
    ],
    []
  );

  const handlePageChange = async (direction: "prev" | "next") => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      if (direction === "next" && data.nextCursor) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        const searchParams = new URLSearchParams();
        searchParams.set("groupName", groupName);
        searchParams.set("cursor", data.nextCursor.toString());
        router.push(`/realtime/group?${searchParams.toString()}`);

        if (!cursorHistory[nextPage - 1]) {
          setCursorHistory((prev) => [...prev, data.nextCursor!]);
        }
      } else if (direction === "prev" && currentPage > 1) {
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        const searchParams = new URLSearchParams();
        searchParams.set("groupName", groupName);
        const cursor = prevPage === 1 ? 0 : cursorHistory[prevPage - 1];
        searchParams.set("cursor", cursor.toString());
        router.push(`/realtime/group?${searchParams.toString()}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const table = useReactTable({
    data: data.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCSVDownload = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const csvData = selectedRows.map((row) => row.original);
    handleDownloadJson2CSV({
      data: csvData,
      fileName: `group-data`,
    });
  };

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        총 {data.count}명의 그룹원이 검색되었습니다.
      </div>
      <div className="flex justify-end">
        <Button
          disabled={table.getSelectedRowModel().rows.length === 0}
          onClick={handleCSVDownload}
          size="sm"
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
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1 || isLoading}
        >
          이전
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentPage} 페이지
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange("next")}
          disabled={!data.nextCursor || isLoading}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
