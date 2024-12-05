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
} from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, useCallback } from "react";
import { CreditTableData, RewardRevoke } from "@/types/credit";
import AddCreditDialog from "../dialog/add-credit-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  approveCreditAction,
  approveAllCreditAction,
  rejectCreditAction,
  rejectAllCreditAction,
  cancelCreditAction,
  getRewardRevokeByIdsOrigin,
  deleteCreditAction,
} from "@/actions/credit-action";
import { toast } from "@/hooks/use-toast";
import { Status } from "@prisma/client";
import { GlobalReturn } from "@/types/global-return";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";

interface CreditTableProps {
  data: CreditTableData;
}

// 상수 분리
const STATUS_MAP: Record<Status, string> = {
  PENDING: "대기중",
  APPROVED: "승인됨",
  REJECTED: "거절됨",
  CANCELLED: "취소됨",
} as const;

const CREDIT_TYPE_MAP: Record<string, string> = {
  MONEY: "현금",
  BANK: "계좌",
  CREDIT: "무료 캐시",
  CREDIT2: "유료 캐시",
  CURRENT_COIN: "마일리지",
} as const;

export function CreditTable({ data }: CreditTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    id: false,
  });
  const { data: session } = useSession();

  // columns 정의를 useMemo로 최적화
  const columns = useMemo<ColumnDef<RewardRevoke>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "userId",
        header: "고유번호",
      },
      {
        accessorKey: "type",
        header: "타입",
        cell: ({ row }) => (
          <div>
            <Badge
              variant={
                row.getValue("type") === "ADD" ? "default" : "destructive"
              }
            >
              {row.getValue("type") === "ADD" ? "지급" : "회수"}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "creditType",
        header: "재화 종류",
        cell: ({ row }) => {
          return (
            CREDIT_TYPE_MAP[row.getValue("creditType") as string] ||
            row.getValue("creditType")
          );
        },
      },
      {
        accessorKey: "amount",
        header: "수량",
        cell: ({ row }) => (
          <div>{formatKoreanNumber(row.getValue("amount"))}원</div>
        ),
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
        cell: ({ row }) => {
          return (
            STATUS_MAP[row.getValue("status") as Status] ||
            row.getValue("status")
          );
        },
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
              cell: ({ row }: { row: Row<RewardRevoke> }) => {
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      {/* <DropdownMenuItem asChild></DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={async () => {
                          if (confirm("정말로 이 항목을 삭제하시겠습니까?")) {
                            const result = await deleteCreditAction(
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

  const tableDatas = useMemo(() => data.records, [data.records]);

  const table = useReactTable({
    data: tableDatas,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
  });

  // useMemo로 계산 최적화
  const isPending = useMemo(
    () =>
      searchParams.get("status") === "PENDING" || !searchParams.get("status"),
    [searchParams]
  );

  // 공통 에러 처리 함수
  const handleError = useCallback((error: unknown, action: string) => {
    console.error(`${action} error:`, error);
    toast({
      title: `${action} 처리 중 오류가 발생했습니다.`,
      variant: "destructive",
    });
  }, []);

  // 공통 성공 처리 함수
  const handleSuccess = useCallback((message: string) => {
    toast({ title: message });
    table.toggleAllPageRowsSelected(false);
  }, []);

  // 선택된 ID 가져오기 함수
  const getSelectedIds = useCallback(() => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    if (!selectedIds.length) {
      toast({ title: "선택된 항목이 없습니다." });
      return null;
    }
    return selectedIds;
  }, [table]);

  // 액션 핸들러 최적화
  const handleAction = useCallback(
    async (
      action: (ids: string[]) => Promise<GlobalReturn<boolean>>,
      successMessage: string,
      actionName: string
    ) => {
      const selectedIds = getSelectedIds();
      if (!selectedIds) return;

      setIsLoading(true);
      try {
        const result = await action(selectedIds);
        if (result.success) {
          handleSuccess(successMessage);
        } else {
          toast({
            title: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        handleError(error, actionName);
      } finally {
        setIsLoading(false);
      }
    },
    [getSelectedIds, handleSuccess, handleError]
  );

  const handleApprove = useCallback(
    () =>
      handleAction(
        approveCreditAction,
        "선택된 항목이 승인되었습니다.",
        "승인"
      ),
    [handleAction]
  );

  const handleReject = useCallback(
    () =>
      handleAction(rejectCreditAction, "선택된 항목이 거절되었습니다.", "거절"),
    [handleAction]
  );

  const handleCancel = useCallback(
    () =>
      handleAction(cancelCreditAction, "선택된 항목이 취소되었습니다.", "취소"),
    [handleAction]
  );

  // 전체 처리 핸들러
  const handleBulkAction = useCallback(
    async (
      action: () => Promise<GlobalReturn<boolean>>,
      successMessage: string,
      actionName: string,
      checkStatus: Status = "PENDING"
    ) => {
      const pendingRows = table
        .getRowModel()
        .rows.filter((row) => row.original.status === checkStatus);

      if (!pendingRows.length) {
        toast({
          title: `${actionName}할 항목이 없습니다.`,
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        const result = await action();
        if (result.success) {
          handleSuccess(successMessage);
        } else {
          toast({
            title: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        handleError(error, `전체 ${actionName}`);
      } finally {
        setIsLoading(false);
      }
    },
    [table, handleSuccess, handleError]
  );

  // 페이지 변경 핸들러 최적화
  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleDownloadCSV = useCallback(async () => {
    const selectedIds = getSelectedIds();
    if (!selectedIds) return;

    setIsLoading(true);
    try {
      const result = await getRewardRevokeByIdsOrigin(selectedIds);
      if (result.success && result.data) {
        handleDownloadJson2CSV({
          data: result.data,
          fileName: "reward_revoke_data",
        });
        toast({ title: "CSV 다운로드 성공" });
      } else {
        toast({
          title: result.message || "CSV 다운로드 실패",
          variant: "destructive",
        });
      }
    } catch (error) {
      handleError(error, "CSV 다운로드");
    } finally {
      setIsLoading(false);
    }
  }, [getSelectedIds, handleError]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {isPending && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleApprove}
              disabled={
                isLoading || table.getSelectedRowModel().rows.length === 0
              }
            >
              승인
            </Button>
            <Button
              onClick={() =>
                handleBulkAction(
                  approveAllCreditAction,
                  "전체 항목이 승인되었습니다.",
                  "전체 승인"
                )
              }
              disabled={isLoading}
            >
              전체 승인
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                isLoading || table.getSelectedRowModel().rows.length === 0
              }
            >
              거절
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                handleBulkAction(
                  rejectAllCreditAction,
                  "전체 항목이 거절되었습니다.",
                  "전체 거절"
                )
              }
              disabled={isLoading}
            >
              전체 거절
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={
                isLoading || table.getSelectedRowModel().rows.length === 0
              }
            >
              취소
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            onClick={handleDownloadCSV}
            disabled={isLoading || !table.getSelectedRowModel().rows.length}
          >
            CSV 다운로드
          </Button>
          <AddCreditDialog open={open} setOpen={setOpen} />
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
