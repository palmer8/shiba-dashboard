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
import Empty from "../ui/empty";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetId, setTargetId] = useState<string>("");

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
                          setTargetId(row.original.id);
                          setIsDeleteDialogOpen(true);
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

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => row.original.id);

      const result = await approveItemQuantitiesAction(selectedIds);
      if (result.success) {
        toast({
          title: "승인 완료",
          description: "선택한 아이템이 성공적으로 승인되었습니다.",
        });
        table.toggleAllPageRowsSelected(false);
      } else {
        toast({
          title: "승인 실패",
          description: result.error || "아이템 승인 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "승인 실패",
        description: "아이템 승인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => row.original.id);

      const result = await cancelItemQuantityAction(selectedIds);
      if (result.success) {
        toast({
          title: "취소 완료",
          description: "선택한 아이템이 성공적으로 취소되었습니다.",
        });
        table.toggleAllPageRowsSelected(false);
      } else {
        toast({
          title: "취소 실패",
          description: result.error || "아이템 취소 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "취소 실패",
        description: "아이템 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => row.original.id);

      const result = await rejectItemQuantitiesAction(selectedIds);
      if (result.success) {
        toast({
          title: "거절 완료",
          description: "선택한 아이템이 성공적으로 거절되었습니다.",
        });
        table.toggleAllPageRowsSelected(false);
      } else {
        toast({
          title: "거절 실패",
          description: result.error || "아이템 거절 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "거절 실패",
        description: "아이템 거절 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAll = async () => {
    try {
      setIsLoading(true);
      const result = await approveAllItemQuantitiesAction();
      if (result.success) {
        toast({
          title: "일괄 승인 완료",
          description: "모든 대기중인 아이템이 성공적으로 승인되었습니다.",
        });
      } else {
        toast({
          title: "일괄 승인 실패",
          description:
            result.error || "아이템 일괄 승인 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "일괄 승인 실패",
        description: "아이템 일괄 승인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAll = async () => {
    try {
      setIsLoading(true);
      const result = await rejectAllItemQuantitiesAction();
      if (result.success) {
        toast({
          title: "일괄 거절 완료",
          description: "모든 대기중인 아이템이 성공적으로 거절되었습니다.",
        });
      } else {
        toast({
          title: "일괄 거절 실패",
          description:
            result.error || "아이템 일괄 거절 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "일괄 거절 실패",
        description: "아이템 일괄 거절 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        toast({
          title: "CSV 다운로드 실패",
          description:
            result.error || "아이템 다운로드 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "CSV 다운로드 실패",
        description: "아이템 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [table]);

  const isPending = useMemo(
    () =>
      searchParams.get("status") === "PENDING" || !searchParams.get("status"),
    [searchParams]
  );

  const hasManageAccess = useMemo(
    () => hasAccess(session?.user?.role, "MASTER"),
    [session]
  );

  const handleDelete = async () => {
    try {
      const result = await deleteItemQuantityAction(targetId);
      if (result.success) {
        toast({
          title: "삭제 완료",
          description: "아이템이 성공적으로 삭제되었습니다.",
        });
      } else {
        toast({
          title: "삭제 실패",
          description: result.error || "아이템 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "아이템 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
  };

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
                <Empty description="데이터가 존재하지 않습니다." />
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

      <ConfirmDialog
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onConfirm={handleApprove}
        title="아이템 승인"
        description="선택한 아이템을 승인하시겠습니까?"
      />

      <ConfirmDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleReject}
        title="아이템 거절"
        description="선택한 아이템을 거절하시겠습니까?"
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="아이템 삭제"
        description="정말로 이 아이템을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
      />
    </div>
  );
}
