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
import { toast } from "@/hooks/use-toast";
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
import { Status, UserRole } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Empty from "@/components/ui/empty";
import { Session } from "next-auth";

interface CreditTableProps {
  data: CreditTableData;
  session: Session;
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

export function CreditTable({ data, session }: CreditTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    id: false,
    status: false,
  });
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
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: Row<RewardRevoke> }) => {
          return (
            hasAccess(session?.user?.role, UserRole.MASTER) && (
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
                        const result = await deleteCreditAction(
                          row.original.id
                        );
                        if (result && result.success) {
                          toast({
                            title: "삭제 성공",
                          });
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
            )
          );
        },
      },
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

  const handleApprove = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    if (!selectedIds.length) {
      toast({ title: "선택된 항목이 없습니다." });
      return;
    }

    setIsLoading(true);
    try {
      const result = await approveCreditAction(selectedIds);
      if (result.success) {
        toast({ title: "승인 성공" });
      } else {
        toast({
          title: "승인 실패",
          description: result.error || "승인 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "승인 실패",
        description: "승인 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    if (!selectedIds.length) {
      toast({ title: "선택된 항목이 없습니다." });
      return;
    }

    setIsLoading(true);
    try {
      const result = await rejectCreditAction(selectedIds);
      if (result.success) {
        toast({ title: "거절 성공" });
      } else {
        toast({
          title: "거절 실패",
          description: result.error || "거절 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "거절 실패",
        description: "거절 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    if (!selectedIds.length) {
      toast({ title: "선택된 항목이 없습니다." });
      return;
    }

    setIsLoading(true);
    try {
      const result = await cancelCreditAction(selectedIds);
      if (result.success) {
        toast({ title: "취소 성공" });
      } else {
        toast({
          title: "취소 실패",
          description: result.error || "취소 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "취소 실패",
        description: "취소 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    setIsLoading(true);
    try {
      const result = await approveAllCreditAction();
      if (result.success) {
        toast({ title: "전체 승인 성공" });
      } else {
        toast({
          title: "전체 승인 실패",
          description: result.error || "전체 승인 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "전체 승인 실패",
        description: "전체 승인 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReject = async () => {
    setIsLoading(true);
    try {
      const result = await rejectAllCreditAction();
      if (result.success) {
        toast({ title: "전체 거절 성공" });
      } else {
        toast({
          title: "전체 거절 실패",
          description: result.error || "전체 거절 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "전체 거절 실패",
        description: "전체 거절 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    if (!selectedIds.length) {
      toast({ title: "선택된 항목이 없습니다." });
      return;
    }

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
          title: "CSV 다운로드 실패",
          description: result.error || "다운로드 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "CSV 다운로드 실패",
        description: "다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {isPending && hasAccess(session?.user?.role, "MASTER") && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleApprove}
              disabled={
                isLoading || table.getSelectedRowModel().rows.length === 0
              }
            >
              승인
            </Button>
            <Button onClick={handleBulkApprove} disabled={isLoading}>
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
              onClick={handleBulkReject}
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
    </div>
  );
}
