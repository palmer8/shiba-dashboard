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
  Row,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { formatKoreanDateTime, handleDownloadJson2CSV, hasAccess, getUTCDateRangeForCSV } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Empty from "@/components/ui/empty";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronRight, RefreshCw, Activity, Zap, Download, Trash2 } from "lucide-react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { PartitionLogData, PartitionLogMetadata } from "@/types/game";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";
import {
  flushLogsAction,
  getHealthCheckAction,
  exportPartitionLogsByDateRangeAction
} from "@/actions/log-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange, SelectRangeEventHandler } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RealtimeUserDataTableProps {
  data: PartitionLogData[];
  metadata: PartitionLogMetadata;
  page: number;
  session: Session;
  userId: number;
  onPageChange: (page: number) => void;
}

export function RealtimeUserDataTable({
  data,
  metadata,
  page,
  session,
  userId,
  onPageChange,
}: RealtimeUserDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(page.toString());
  const [modalOpen, setModalOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isFlushingLogs, setIsFlushingLogs] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const tableContainerRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    setInputPage(page.toString());
  }, [page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [page]);

  // 건강 상태 확인
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await getHealthCheckAction();
        if (result.success) {
          setHealthStatus(result.data);
        }
      } catch (error) {
        console.error("Health check failed:", error);
      }
    };

    checkHealth();
    // 30초마다 헬스체크
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const MetadataCell = useCallback(({ row }: { row: Row<PartitionLogData> }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            {row.original.metadata ? (
              <>
                <ChevronRight className="h-4 w-4" />
                <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] text-muted-foreground">
                  {JSON.stringify(row.original.metadata).slice(0, 50)}...
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        </PopoverTrigger>
        {row.original.metadata && (
          <PopoverContent className="w-96">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(row.original.metadata, null, 2)}
            </pre>
          </PopoverContent>
        )}
      </Popover>
    );
  }, []);

  const handleFlushLogs = useCallback(async () => {
    if (isFlushingLogs) return;

    try {
      setIsFlushingLogs(true);
      const result = await flushLogsAction();

      if (result.success) {
        toast({
          title: "로그 플러시 완료",
          description: "메모리에 있던 로그가 데이터베이스로 플러시되었습니다.",
        });
      } else {
        throw new Error(result.error ?? "알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      toast({
        title: "로그 플러시 실패",
        description:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsFlushingLogs(false);
    }
  }, [isFlushingLogs]);

  const columns = useMemo<ColumnDef<PartitionLogData>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "시간",
        cell: ({ row }) => (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis">
            {row.original.timestamp ?
              formatKoreanDateTime(new Date(row.original.timestamp)) :
              formatKoreanDateTime(new Date())
            }
          </div>
        ),
      },
      {
        accessorKey: "level",
        header: "레벨",
        cell: ({ row }) => {
          const level = row.original.level;
          return (
            <div className="whitespace-nowrap">
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
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "타입",
        cell: ({ row }) => (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
            {row.original.type}
          </div>
        ),
      },
      {
        accessorKey: "message",
        header: "메시지",
        cell: ({ row }) => (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
            {row.original.message}
          </div>
        ),
      },
      {
        accessorKey: "metadata",
        header: "메타데이터",
        cell: MetadataCell,
      },
    ],
    [MetadataCell]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });


  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > metadata.totalPages) return;
    onPageChange(newPage);
  };

  const handleExport = async () => {
    try {
      handleDownloadJson2CSV({
        data: data,
        fileName: `user-partition-logs-${userId}`,
      });
      toast({
        title: "유저 파티션 로그 CSV 파일을 다운로드하였습니다.",
      });
    } catch (error) {
      toast({
        title: "유저 파티션 로그 CSV 파일 다운로드에 실패했습니다.",
        description: "잠시 후에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleCsvDownload = async () => {
    const dateRange = getUTCDateRangeForCSV(range);
    if (!dateRange) return;
    
    setCsvLoading(true);
    setCsvError(null);
    
    const { startDate, endDate } = dateRange;
    
    // 현재 페이지의 필터 조건 가져오기
    const searchParams = new URLSearchParams(window.location.search);
    const currentFilters = {
      type: searchParams.get('type') || undefined,
      level: searchParams.get('level') || undefined,
      message: searchParams.get('message') || undefined,
      metadata: searchParams.get('metadata') || undefined,
      userId: searchParams.get('userId') ? Number(searchParams.get('userId')) : undefined,
    };
    
    const result = await exportPartitionLogsByDateRangeAction(startDate, endDate, currentFilters);
    setCsvLoading(false);
    if (result.success) {
      // 빈 데이터 체크
      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        toast({
          title: "데이터 없음",
          description: "선택한 기간에 다운로드할 데이터가 없습니다.",
          variant: "destructive",
        });
        setModalOpen(false);
        return;
      }

      handleDownloadJson2CSV({
        data: result.data,
        fileName: `user-partition-logs-${startDate}_to_${endDate}`,
      });
      setModalOpen(false);
    } else {
      setCsvError(result.error || "다운로드 실패");
    }
  };

  if (!data?.length) {
    return (
      <div className="rounded-md p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Empty description="데이터가 존재하지 않습니다." />
        </div>
      </div>
    );
  }

  return (
    <>
      <Table ref={tableContainerRef}>
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
                value={inputPage}
                onChange={(e) => {
                  setInputPage(e.target.value);
                }}
                onBlur={(e) => {
                  let newPage = parseInt(e.target.value);
                  if (isNaN(newPage) || newPage < 1) {
                    newPage = 1;
                  } else if (newPage > metadata.totalPages) {
                    newPage = metadata.totalPages;
                  }
                  setInputPage(newPage.toString());
                  handlePageChange(newPage);
                }}
                className="w-12 rounded-md border border-input bg-background px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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


      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>CSV 기간 다운로드</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange as SelectRangeEventHandler}
              numberOfMonths={1}
              className="mx-auto"
            />
            <div className="text-xs text-muted-foreground text-center">
              시작일과 종료일을 선택하세요. (시간은 무시됩니다)
            </div>
            {csvError && (
              <div className="text-center text-destructive text-xs">
                {csvError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleCsvDownload}
              disabled={!range?.from || csvLoading}
            >
              {csvLoading ? "다운로드 중..." : "다운로드"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
