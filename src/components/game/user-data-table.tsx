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
import { formatKoreanDateTime, handleDownloadJson2CSV } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { exportGameLogsAction } from "@/actions/log-action";
import { toast } from "@/hooks/use-toast";
import Empty from "@/components/ui/empty";

interface GameLogData {
  id: number;
  timestamp: Date;
  level: string;
  type: string;
  message: string;
  metadata?: any;
}

interface LogMetadata {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

interface UserDataTableProps {
  data: GameLogData[];
  metadata: LogMetadata;
  page: number;
}

export function UserDataTable({ data, metadata, page }: UserDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const columns: ColumnDef<GameLogData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: "timestamp",
      header: "시간",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatKoreanDateTime(row.original.timestamp)}
        </span>
      ),
    },
    {
      accessorKey: "level",
      header: "레벨",
      cell: ({ row }) => {
        const level = row.original.level;
        return (
          <Badge
            variant={
              level === "error"
                ? "destructive"
                : level === "warn"
                ? "outline"
                : level === "info"
                ? "default"
                : "secondary"
            }
          >
            {level}
          </Badge>
        );
      },
    },
    {
      accessorKey: "type",
      header: "타입",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.type}</span>
      ),
    },
    {
      accessorKey: "message",
      header: "메시지",
      cell: ({ row }) => <span>{row.original.message}</span>,
    },
    {
      accessorKey: "metadata",
      header: "메타데이터",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.metadata ? JSON.stringify(row.original.metadata) : "-"}
        </span>
      ),
    },
  ];

  if (!data?.length) {
    return (
      <div className="rounded-md border border-dashed p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            로그 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/log/user?${params.toString()}`);
  };

  const handleExport = async () => {
    const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
    try {
      const result = await exportGameLogsAction(ids);
      if (result.success) {
        handleDownloadJson2CSV({
          data: result.data ?? [],
          fileName: `user-logs`,
        });
        toast({
          title: "유저 데이터 로그 CSV 파일을 다운로드하였습니다.",
        });
      }
    } catch (error) {
      toast({
        title: "유저 데이터 로그 CSV 파일 다운로드에 실패했습니다.",
        description: "잠시 후에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleExport}
          disabled={table.getSelectedRowModel().rows.length === 0}
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
                <Empty description="데이터가 존재하지 않습니다." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {data.length > 0 && (
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
