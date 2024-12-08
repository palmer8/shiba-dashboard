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
import {
  formatKoreanDateTime,
  formatKoreanNumber,
  handleDownloadJson2CSV,
  hasAccess,
} from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, useCallback } from "react";
import { ItemQuantityTableData, ItemQuantity } from "@/types/quantity";
import AddItemQuantityDialog from "../dialog/add-item-quantity-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  approveItemQuantitiesAction,
  approveAllItemQuantitiesAction,
  rejectItemQuantitiesAction,
  rejectAllItemQuantitiesAction,
  cancelItemQuantityAction,
  getItemQuantitiesByIdsOrigin,
  deleteItemQuantityAction,
} from "@/actions/quantity-action";
import { toast } from "@/hooks/use-toast";
import { Status, ActionType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";

interface ItemQuantityTableProps {
  data: ItemQuantityTableData;
}

const STATUS_MAP: Record<Status, string> = {
  PENDING: "대기중",
  APPROVED: "승인됨",
  REJECTED: "거절됨",
  CANCELLED: "취소됨",
} as const;

const ACTION_TYPE_MAP: Record<ActionType, string> = {
  ADD: "지급",
  REMOVE: "회수",
} as const;

export function ItemQuantityTable({ data }: ItemQuantityTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    status: false,
  });

  const columns = useMemo<ColumnDef<ItemQuantity>[]>(
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
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "userId",
        header: "고유번호",
      },
      {
        accessorKey: "itemName",
        header: "아이템명",
      },
      {
        accessorKey: "amount",
        header: "수량",
        cell: ({ row }) => formatKoreanNumber(row.getValue("amount")) + "개",
      },
      {
        accessorKey: "type",
        header: "유형",
        cell: ({ row }) => (
          <Badge
            variant={row.getValue("type") === "ADD" ? "default" : "destructive"}
          >
            {ACTION_TYPE_MAP[row.getValue("type") as ActionType]}
          </Badge>
        ),
      },
      {
        accessorKey: "reason",
        header: "사유",
      },
      {
        accessorKey: "createdAt",
        header: "등록일",
        cell: ({ row }) => formatKoreanDateTime(row.getValue("createdAt")),
      },
      {
        accessorKey: "approvedAt",
        header: "승인일",
        cell: ({ row }) =>
          row.getValue("approvedAt")
            ? formatKoreanDateTime(row.getValue("approvedAt"))
            : "-",
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) =>
          STATUS_MAP[row.getValue("status") as Status] ||
          row.getValue("status"),
      },
      {
        accessorKey: "registrant.nickname",
        header: "등록자",
        cell: ({ row }) => row.original.registrant?.nickname || "-",
      },
      {
        accessorKey: "approver.nickname",
        header: "승인자",
        cell: ({ row }) => row.original.approver?.nickname || "-",
      },
      ...(session?.user?.role === "SUPERMASTER"
        ? [
            {
              id: "actions",
              header: "관리",
              cell: ({ row }: { row: Row<ItemQuantity> }) => {
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        onClick={async () => {
                          if (confirm("정말로 이 항목을 삭제하시겠습니까?")) {
                            const result = await deleteItemQuantityAction(
                              row.original.id
                            );
                            if (result && result.success) {
                              handleSuccess(result.message);
                            }
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
    data: data.records,
    columns,
    state: {
      columnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSuccess = useCallback((message: string) => {
    toast({
      title: "성공",
      description: message,
    });
  }, []);

  const handleError = useCallback((error: any) => {
    toast({
      title: "오류 발생",
      description: error.message,
      variant: "destructive",
    });
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleApprove = useCallback(async () => {
    try {
      setIsLoading(true);
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => row.original.id);

      const result = await approveItemQuantitiesAction(selectedIds);
      if (result.success) {
        handleSuccess(result.message);
        table.toggleAllPageRowsSelected(false);
      } else {
        handleError(result);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [table, handleSuccess, handleError]);

  const handleCancel = useCallback(async () => {
    try {
      setIsLoading(true);
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => row.original.id);

      const result = await cancelItemQuantityAction(selectedIds);
      if (result.success) {
        handleSuccess(result.message);
        table.toggleAllPageRowsSelected(false);
      } else {
        handleError(result);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [table, handleSuccess, handleError]);

  const handleReject = useCallback(async () => {
    try {
      setIsLoading(true);
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => row.original.id);

      const result = await rejectItemQuantitiesAction(selectedIds);
      if (result.success) {
        handleSuccess(result.message);
        table.toggleAllPageRowsSelected(false);
      } else {
        handleError(result);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [table, handleSuccess, handleError]);

  const handleApproveAll = useCallback(async () => {
    if (confirm("정말로 모든 대기중인 항목을 승인하시겠습니까?")) {
      try {
        setIsLoading(true);
        const result = await approveAllItemQuantitiesAction();
        if (result.success) {
          handleSuccess(result.message);
        } else {
          handleError(result);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [handleSuccess, handleError]);

  const handleRejectAll = useCallback(async () => {
    if (confirm("정말로 모든 대기중인 항목을 거절하시겠습니까?")) {
      try {
        setIsLoading(true);
        const result = await rejectAllItemQuantitiesAction();
        if (result.success) {
          handleSuccess(result.message);
        } else {
          handleError(result);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [handleSuccess, handleError]);

  const handleDownloadCSV = useCallback(async () => {
    try {
      setIsLoading(true);
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => row.original.id);
      const result = await getItemQuantitiesByIdsOrigin(selectedIds);

      if (result.success && result.data) {
        handleDownloadJson2CSV({
          data: result.data,
          fileName: "item-quantity",
        });
        table.toggleAllPageRowsSelected(false);
      } else {
        handleError(result);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [table, handleSuccess, handleError]);

  const isPending = useMemo(
    () =>
      searchParams.get("status") === "PENDING" || !searchParams.get("status"),
    [searchParams]
  );

  const hasManageAccess = useMemo(
    () => hasAccess(session?.user?.role, "MASTER"),
    [session]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPending && hasManageAccess && (
            <>
              <Button
                onClick={handleApprove}
                disabled={isLoading || !table.getSelectedRowModel().rows.length}
              >
                승인
              </Button>
              <Button
                onClick={handleReject}
                disabled={isLoading || !table.getSelectedRowModel().rows.length}
                variant="destructive"
              >
                거절
              </Button>
              <Button onClick={handleApproveAll} disabled={isLoading}>
                전체 승인
              </Button>
              <Button
                onClick={handleRejectAll}
                disabled={isLoading}
                variant="destructive"
              >
                전체 거절
              </Button>
              <Button
                disabled={isLoading || !table.getSelectedRowModel().rows.length}
                onClick={handleCancel}
              >
                취소
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadCSV}
            disabled={isLoading || !table.getSelectedRowModel().rows.length}
          >
            CSV 다운로드
          </Button>
          {hasManageAccess && (
            <AddItemQuantityDialog open={open} setOpen={setOpen} />
          )}
        </div>
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
