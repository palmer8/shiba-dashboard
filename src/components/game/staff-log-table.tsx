"use client";

import { Button } from "@/components/ui/button";
import { formatKoreanDateTime, handleDownloadJson2CSV } from "@/lib/utils";
import { StaffLog, StaffLogResponse } from "@/types/log";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import Empty from "@/components/ui/empty";
import { useState, useEffect, useRef } from "react";
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
import { toast } from "@/hooks/use-toast";
import { useDragSelect } from "@/hooks/use-drag-select";

interface StaffLogTableProps {
  data: StaffLogResponse;
}

export function StaffLogTable({ data }: StaffLogTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(data.page.toString());
  const tableContainerRef = useRef<HTMLTableElement>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { tableProps } = useDragSelect(null, {
    isRowSelectedById: (id) => selectedRows.includes(id),
    toggleRowById: (id, selected) => {
      setSelectedRows((prev) => {
        const exists = prev.includes(id);
        if (selected) {
          return exists ? prev : [...prev, id];
        }
        return prev.filter((x) => x !== id);
      });
    },
  });

  useEffect(() => {
    setInputPage(data.page.toString());
  }, [data.page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [data.page]);

  const createLogId = (log: StaffLog) => {
    return `${log.staff_id}-${log.target_id}-${new Date(log.time).getTime()}`;
  };

  const handleSelect = (log: StaffLog) => {
    const logId = createLogId(log);
    setSelectedRows((prev) =>
      prev.includes(logId)
        ? prev.filter((rowId) => rowId !== logId)
        : [...prev, logId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows((prev) =>
      prev.length === data.records.length
        ? []
        : data.records.map((log) => createLogId(log))
    );
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));

    if (newPage < 1 || newPage > data.totalPages) return;

    router.push(`/log/staff?${params.toString()}`, { scroll: false });
  };

  const handleDownload = () => {
    try {
      const selectedLogs = data.records.filter((log) => {
        const logId = createLogId(log);
        return selectedRows.includes(logId);
      });

      handleDownloadJson2CSV({
        data: selectedLogs,
        fileName: "staff-logs",
      });

      toast({
        title: "CSV 다운로드 성공",
      });
    } catch (error) {
      toast({
        title: "CSV 다운로드 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<StaffLog>[] = [
      {
        id: "select",
        header: ({ table }) => {
          const allSelected = selectedRows.length === data.records.length && data.records.length > 0;
          const someSelected = selectedRows.length > 0 && !allSelected;
          return (
            <Checkbox
              checked={allSelected || (someSelected && "indeterminate")}
              onCheckedChange={(value) => {
                const next = !!value;
                if (next) {
                  setSelectedRows(data.records.map((log) => createLogId(log)));
                } else {
                  setSelectedRows([]);
                }
              }}
              aria-label="Select all"
            />
          );
        },
        cell: ({ row }) => {
          const logId = createLogId(row.original);
          const isChecked = selectedRows.includes(logId);
          return (
            <Checkbox
              checked={isChecked}
              onCheckedChange={(value) => {
                const next = !!value;
                setSelectedRows((prev) => {
                  if (next) {
                    if (prev.includes(logId)) return prev;
                    return [...prev, logId];
                  } else {
                    return prev.filter((id) => id !== logId);
                  }
                });
              }}
              aria-label="Select row"
            />
          );
        },
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "설명",
      accessorKey: "description",
      cell: ({ row }) => {
        const logId = createLogId(row.original);
        const isExpanded = expandedRows.has(logId);
        
        const toggleExpanded = () => {
          setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(logId)) {
              newSet.delete(logId);
            } else {
              newSet.add(logId);
            }
            return newSet;
          });
        };

        return (
          <div className="max-w-[300px] font-medium">
            <div 
              className={`cursor-pointer ${!isExpanded ? 'truncate' : ''}`}
              onClick={toggleExpanded}
              title={!isExpanded ? "클릭하여 전체 내용 보기" : "클릭하여 접기"}
            >
              {row.original.description}
            </div>
          </div>
        );
      },
    },
    {
      header: "처리자",
      accessorKey: "staff_name",
      cell: ({ row }) => (
        <div>
          {row.original.staff_name} ({row.original.staff_id})
        </div>
      ),
    },
    {
      header: "대상자",
      accessorKey: "target_name",
      cell: ({ row }) => (
        <div>
          {row.original.target_name} ({row.original.target_id})
        </div>
      ),
    },
    {
      header: "시간",
      accessorKey: "time",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatKoreanDateTime(new Date(row.original.time))}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: data.records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={selectedRows.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            CSV 다운로드
          </Button>
        </div>
      </div>

      <Table ref={tableContainerRef} {...tableProps}>
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
        {data.records.length > 0 ? (
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/50"
                data-row-id={createLogId(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        ) : (
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Empty description="데이터가 존재하지 않습니다." />
              </TableCell>
            </TableRow>
          </TableBody>
        )}
      </Table>

      {data.records.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            총 {data.total}개 중 {(data.page - 1) * data.pageSize + 1}-
            {Math.min(data.page * data.pageSize, data.total)}개 표시
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
      )}
    </div>
  );
}
