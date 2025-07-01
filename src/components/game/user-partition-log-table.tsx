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
import { formatKoreanDateTime, hasAccess } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Empty from "@/components/ui/empty";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronRight, RefreshCw, Activity, Zap, Download } from "lucide-react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { PartitionLogData, PartitionLogMetadata } from "@/types/game";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";
import { flushLogsAction, getHealthCheckAction, exportPartitionLogsByDateRangeAction } from "@/actions/log-action";
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
import { handleDownloadJson2CSV } from "@/lib/utils";

interface PartitionLogTableProps {
  data: PartitionLogData[];
  metadata: PartitionLogMetadata;
  page: number;
  session: Session;
}

export function UserPartitionLogTable({
  data,
  metadata,
  page,
  session,
}: PartitionLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(page.toString());
  const [isFlushingLogs, setIsFlushingLogs] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
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

  const columns = useMemo<ColumnDef<PartitionLogData>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "시간",
        cell: ({ row }) => (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis min-w-[120px] md:min-w-[140px] text-xs md:text-sm">
            {row.original.timestamp ? 
              formatKoreanDateTime(new Date(row.original.timestamp)) : 
              '-'
            }
          </div>
        ),
      },
      {
        accessorKey: "level",
        header: "레벨",
        cell: ({ row }) => {
          const level = row.original.level || 'info';
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
                    : level === "debug"
                    ? "secondary"
                    : "default"
                }
              >
                {level.toUpperCase()}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "타입",
        cell: ({ row }) => (
          <div className="relative max-w-[100px] group">
            <div className="overflow-hidden">
              <Badge 
                variant="outline" 
                className="font-mono text-[10px] px-1.5 py-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full cursor-help"
                title={row.original.type}
              >
                {row.original.type}
              </Badge>
            </div>
            {/* Hover시 전체 텍스트 표시 */}
            {row.original.type.length > 15 && (
              <div className="absolute left-0 top-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <Badge 
                  variant="outline" 
                  className="font-mono text-[10px] px-1.5 py-0.5 whitespace-nowrap bg-background border shadow-lg"
                >
                  {row.original.type}
                </Badge>
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "message",
        header: "메시지",
        cell: ({ row }) => (
          <div className="relative max-w-[300px] group">
            <div className="overflow-hidden">
              <span 
                className="inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-full cursor-help"
                title={row.original.message}
              >
                {row.original.message}
              </span>
            </div>
            {/* Hover시 전체 텍스트 표시 */}
            {row.original.message.length > 50 && (
              <div className="absolute left-0 top-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-background border rounded px-2 py-1 shadow-lg text-sm whitespace-nowrap max-w-[500px] overflow-hidden">
                  <span className="text-foreground">
                    {row.original.message}
                  </span>
                </div>
              </div>
            )}
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
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/log/user-partition?${params.toString()}`, { scroll: false });
  };

  const handleFlushLogs = useCallback(async () => {
    if (isFlushingLogs) return;

    try {
      setIsFlushingLogs(true);
      const result = await flushLogsAction();

      if (result.success) {
        toast({
          title: "로그 플러시 완료",
          description: `${result.data?.processed || 0}개의 로그가 처리되었습니다.`,
        });
        router.refresh();
      } else {
        throw new Error(result.error || "플러시 실패");
      }
    } catch (error) {
      toast({
        title: "로그 플러시 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsFlushingLogs(false);
    }
  }, [router, isFlushingLogs]);

  const handleCsvDownload = useCallback(async () => {
    if (!range || !range.from || !range.to) return;
    
    setCsvLoading(true);
    setCsvError(null);
    
    try {
      const startDate = range.from.toISOString().slice(0, 10);
      const endDate = range.to.toISOString().slice(0, 10);
      const result = await exportPartitionLogsByDateRangeAction(startDate, endDate);
      
      if (result.success && result.data) {
        handleDownloadJson2CSV({
          data: result.data,
          fileName: `partition-logs-${startDate}_to_${endDate}`,
        });
        toast({
          title: "CSV 다운로드 완료",
          description: `${result.data.length}개의 로그가 다운로드되었습니다.`,
        });
        setModalOpen(false);
        setRange(undefined);
      } else {
        throw new Error(result.error || "다운로드 실패");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "다운로드 실패";
      setCsvError(errorMessage);
      toast({
        title: "CSV 다운로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCsvLoading(false);
    }
  }, [range]);

  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        {/* 서버 상태 및 관리 도구 - MASTER 이상만 표시 */}
        {session.user && hasAccess(session.user.role, UserRole.MASTER) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              서버 관리 도구
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFlushLogs}
                disabled={isFlushingLogs}
                className="gap-2 w-full sm:w-auto"
              >
                {isFlushingLogs ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    플러시 중...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">메모리 로그 강제 플러시</span>
                    <span className="sm:hidden">강제 플러시</span>
                  </>
                )}
              </Button>
              {healthStatus && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                  <div className={`w-2 h-2 rounded-full ${
                    healthStatus.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="whitespace-nowrap">서버 상태: {healthStatus.status === 'healthy' ? '정상' : '오류'}</span>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="gap-2 w-full md:w-auto"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV 기간 다운로드</span>
              <span className="sm:hidden">CSV 다운로드</span>
            </Button>
          </CardContent>
        </Card>
        )}

        <div className="rounded-md p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Empty description="조회된 로그가 없습니다. 검색 조건을 변경해보세요." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 서버 상태 및 관리 도구 - MASTER 이상만 표시 */}
      {session.user && hasAccess(session.user.role, UserRole.MASTER) && (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            서버 관리 도구
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFlushLogs}
              disabled={isFlushingLogs}
              className="gap-2 w-full sm:w-auto"
            >
              {isFlushingLogs ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  플러시 중...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">메모리 로그 강제 플러시</span>
                  <span className="sm:hidden">강제 플러시</span>
                </>
              )}
            </Button>
            {healthStatus && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                <div className={`w-2 h-2 rounded-full ${
                  healthStatus.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="whitespace-nowrap">서버 상태: {healthStatus.status === 'healthy' ? '정상' : '오류'}</span>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-2 w-full md:w-auto"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">CSV 기간 다운로드</span>
            <span className="sm:hidden">CSV 다운로드</span>
          </Button>
        </CardContent>
      </Card>
      )}

      {/* 로그 테이블 */}
      <div className="rounded-md overflow-auto">
        <Table ref={tableContainerRef} className="min-w-[800px]">
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
      </div>

      {/* 페이지네이션 */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            <div className="hidden sm:block">
              총 {metadata.totalCount.toLocaleString()}개 중 {((page - 1) * 50 + 1).toLocaleString()}
              -{Math.min(page * 50, metadata.totalCount).toLocaleString()}개 표시
              (메모리: {metadata.memoryLogs.toLocaleString()}개, DB: {metadata.databaseLogs.toLocaleString()}개)
            </div>
            <div className="sm:hidden">
              {((page - 1) * 50 + 1).toLocaleString()}-{Math.min(page * 50, metadata.totalCount).toLocaleString()} / {metadata.totalCount.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
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
                    setInputPage("1");
                  } else if (newPage > metadata.totalPages) {
                    newPage = metadata.totalPages;
                    setInputPage(metadata.totalPages.toString());
                  }
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

      {/* CSV 기간 다운로드 모달 */}
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
              disabled={!range?.from || !range?.to || csvLoading}
            >
              {csvLoading ? "다운로드 중..." : "다운로드"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 