"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { formatKoreanDateTime, hasAccess } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { BlockTicket } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  approveAllBlockTicketAction,
  approveBlockTicketAction,
  rejectBlockTicketAction,
  rejectAllBlockTicketAction,
} from "@/actions/report-action";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface BlockTicketTableProps {
  data: {
    records: (BlockTicket & {
      registrant: { id: string; nickname: string; userId: number };
    })[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
}

const STATUS_MAP: Record<"PENDING" | "APPROVED" | "REJECTED", string> = {
  PENDING: "대기중",
  APPROVED: "승인됨",
  REJECTED: "거절됨",
} as const;

export function BlockTicketTable({ data }: BlockTicketTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<
    ColumnDef<
      BlockTicket & {
        registrant: { id: string; nickname: string; userId: number };
      }
    >[]
  >(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="모두 선택"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="행 선택"
          />
        ),
      },
      {
        id: "id",
        accessorKey: "id",
      },
      {
        header: "보고서 ID",
        accessorKey: "reportId",
      },
      {
        header: "고유번호",
        accessorKey: "userId",
        cell: ({ row }) => (
          <span>
            {row.original.registrant?.nickname} (
            {row.original.registrant?.userId})
          </span>
        ),
      },
      {
        header: "상태",
        accessorKey: "status",
        cell: ({ row }) => (
          <Badge variant="outline">
            {
              STATUS_MAP[
                row.original.status as "PENDING" | "APPROVED" | "REJECTED"
              ]
            }
          </Badge>
        ),
      },
      {
        header: "등록일",
        accessorKey: "createdAt",
        cell: ({ row }) => formatKoreanDateTime(row.original.createdAt),
      },
      {
        header: "승인일",
        accessorKey: "approvedAt",
        cell: ({ row }) =>
          row.original.approvedAt
            ? formatKoreanDateTime(row.original.approvedAt)
            : "-",
      },
    ],
    []
  );

  const table = useReactTable({
    data: data.records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    initialState: {
      columnVisibility: {
        id: false,
      },
    },
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleApproveSelected = async () => {
    if (!confirm("선택한 티켓을 승인하시겠습니까?")) return;
    setIsLoading(true);

    try {
      const selectedIds = Object.keys(rowSelection).map(
        (idx) => data.records[parseInt(idx)].id
      );
      const result = await approveBlockTicketAction(selectedIds);

      if (result.success) {
        toast({
          title: "승인 완료",
          description: "선택한 티켓이 승인되었습니다.",
        });
        router.refresh();
      } else {
        toast({
          title: "승인 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "승인 실패",
        description: "티켓 승인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectSelected = async () => {
    if (!confirm("선택한 티켓을 거절하시겠습니까?")) return;
    setIsLoading(true);

    try {
      const selectedIds = Object.keys(rowSelection).map(
        (idx) => data.records[parseInt(idx)].id
      );
      const result = await rejectBlockTicketAction(selectedIds);

      if (result.success) {
        toast({
          title: "거절 완료",
          description: "선택한 티켓이 거절되었습니다.",
        });
        router.refresh();
      } else {
        toast({
          title: "거절 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "거절 실패",
        description: "티켓 거절 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm("전체 티켓을 승인하시겠습니까?")) return;
    setIsLoading(true);

    try {
      const result = await approveAllBlockTicketAction();
      if (result.success) {
        toast({
          title: "전체 승인 완료",
          description: "전체 티켓이 승인되었습니다.",
        });
      } else {
        toast({
          title: "전체 승인 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "전체 승인 실패",
        description: "티켓 전체 승인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAll = async () => {
    if (!confirm("전체 티켓을 거절하시겠습니까?")) return;
    setIsLoading(true);

    try {
      const result = await rejectAllBlockTicketAction();
      if (result.success) {
        toast({
          title: "전체 거절 완료",
          description: "전체 티켓이 거절되었습니다.",
        });
      } else {
        toast({
          title: "전체 거절 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "전체 거절 실패",
        description: "티켓 전체 거절 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPending =
    searchParams.get("status") === "PENDING" || !searchParams.get("status");

  return (
    <div className="space-y-4">
      {data.records.length > 0 && isPending && (
        <div className="flex justify-end gap-2">
          <Button
            variant="destructive"
            onClick={handleRejectSelected}
            disabled={isLoading || Object.keys(rowSelection).length === 0}
          >
            선택 거절
          </Button>
          <Button
            variant="destructive"
            onClick={handleRejectAll}
            disabled={isLoading}
          >
            전체 거절
          </Button>
          <Button
            onClick={handleApproveSelected}
            disabled={isLoading || Object.keys(rowSelection).length === 0}
          >
            선택 승인
          </Button>
          <Button onClick={handleApproveAll} disabled={isLoading}>
            전체 승인
          </Button>
        </div>
      )}

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
          총 {data.metadata.total}개 중 {(data.metadata.page - 1) * 50 + 1}-
          {Math.min(data.metadata.page * 50, data.metadata.total)}개 표시
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.metadata.page - 1)}
            disabled={data.metadata.page <= 1}
          >
            이전
          </Button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={data.metadata.page}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page > 0 && page <= data.metadata.totalPages) {
                  handlePageChange(page);
                }
              }}
              className="w-12 rounded-md border border-input bg-background px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
              max={data.metadata.totalPages}
            />
            <span className="text-sm text-muted-foreground">
              / {data.metadata.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.metadata.page + 1)}
            disabled={data.metadata.page >= data.metadata.totalPages}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
