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
import {
  formatKoreanDateTime,
  handleDownloadJson2CSV,
  hasAccess,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  deleteGameLogsAction,
  exportGameLogsAction,
  exportGameLogsByDateRangeAction,
} from "@/actions/log-action";
import { toast } from "@/hooks/use-toast";
import Empty from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Download } from "lucide-react";
import { UserRole } from "@prisma/client";
import { Session } from "next-auth";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronRight } from "lucide-react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { DateRange, SelectRangeEventHandler } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  session: Session;
  onPageChange: (page: number) => void;
}

export function RealtimeUserDataTable({
  data,
  metadata,
  page,
  session,
  onPageChange,
}: UserDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [inputPage, setInputPage] = useState(page.toString());
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

  const MetadataCell = useCallback(({ row }: { row: Row<GameLogData> }) => {
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

  const handleSingleDelete = useCallback(
    async (id: number) => {
      if (isDeleting) return;

      try {
        setIsDeleting(true);
        const result = await deleteGameLogsAction([id]);

        if (result.success) {
          toast({
            title: "삭제 완료",
            description: "로그가 삭제되었습니다.",
          });
        } else {
          throw new Error(result.error ?? "알 수 없는 오류가 발생했습니다.");
        }
      } catch (error) {
        toast({
          title: "삭제 실패",
          description:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [router, isDeleting]
  );

  const columns = useMemo<ColumnDef<GameLogData>[]>(
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
        accessorKey: "timestamp",
        header: "시간",
        cell: ({ row }) => (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis">
            {formatKoreanDateTime(row.original.timestamp)}
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
      {
        id: "actions",
        cell: ({ row }) => {
          const log = row.original;
          if (!hasAccess(session.user!.role, UserRole.SUPERMASTER)) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  disabled={isDeleting}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleSingleDelete(log.id)}
                  disabled={isDeleting}
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
    ],
    [MetadataCell, handleSingleDelete, isDeleting, session.user?.role]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleBulkDelete = useCallback(async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const result = await deleteGameLogsAction(selectedIds);

      if (result.success) {
        toast({
          title: "삭제 완료",
          description: `${result.data?.deletedCount}개의 로그가 삭제되었습니다.`,
        });
        router.refresh();
      } else {
        throw new Error(result.error ?? "알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      toast({
        title: "삭제 실패",
        description:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedIds([]);
      table.resetRowSelection();
    }
  }, [router, selectedIds, isDeleting, table]);

  const handleShowDeleteDialog = useCallback(() => {
    const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
    setSelectedIds(ids);
    setShowDeleteDialog(true);
  }, [table]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > metadata.totalPages) return;
    onPageChange(newPage);
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

  const handleCsvDownload = async () => {
    if (!range || !range.from || !range.to) return;
    setCsvLoading(true);
    setCsvError(null);
    const startDate = range.from.toISOString().slice(0, 10);
    const endDate = range.to.toISOString().slice(0, 10);
    const result = await exportGameLogsByDateRangeAction(startDate, endDate);
    setCsvLoading(false);
    if (result.success) {
      handleDownloadJson2CSV({
        data: result.data ?? [],
        fileName: `user-logs-${startDate}_to_${endDate}`,
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
      <div className="flex justify-between items-center mb-4">
        {session?.user?.role === UserRole.SUPERMASTER && (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleShowDeleteDialog}
              disabled={
                table.getSelectedRowModel().rows.length === 0 || isDeleting
              }
            >
              <Trash className="h-4 w-4 mr-2" />
              삭제
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          CSV 다운로드
        </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            CSV 기간 다운로드
          </Button>
        </div>
      </div>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그 일괄 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 {selectedIds.length}개의 로그를 삭제하시겠습니까? 이 작업은
              되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </>
  );
}
