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
import { toast as sonnerToast } from "sonner";
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
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { CreditTableData, RewardRevoke } from "@/types/credit";
import AddCreditDialog from "@/components/dialog/add-credit-dialog";
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
import { ActionType, Status, UserRole } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Download, Edit2, MoreHorizontal, Plus, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Empty from "@/components/ui/empty";
import { Session } from "next-auth";
import {
  CREDIT_TYPE_MAP,
  ACTION_TYPE_MAP,
  STATUS_MAP,
} from "@/lib/validations/credit";
import EditCreditDialog from "@/components/dialog/edit-credit-dialog";

interface CreditTableProps {
  data: CreditTableData;
  session: Session;
}

export function CreditTable({ data, session }: CreditTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    id: false,
    status: false,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<RewardRevoke | null>(
    null
  );
  const [inputPage, setInputPage] = useState(data.metadata.page.toString());
  const tableContainerRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    setInputPage(data.metadata.page.toString());
  }, [data.metadata.page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [data.metadata.page]);

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
        cell: ({ row }) => {
          const record = row.original;
          return (
            <TableCell>
              {record.userId}
              {record.nickname && (
                <span className="ml-2 text-muted-foreground">
                  ({record.nickname})
                </span>
              )}
            </TableCell>
          );
        },
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
              {ACTION_TYPE_MAP[row.getValue("type") as ActionType]}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "creditType",
        header: "재화 종류",
        cell: ({ row }) => {
          return CREDIT_TYPE_MAP[row.getValue("creditType") as string];
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
          return STATUS_MAP[row.getValue("status") as Status];
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
        cell: ({ row }) => {
          const credit = row.original;
          const canModify =
            (credit.status === "PENDING" &&
              credit.registrantId === session?.user?.id) ||
            hasAccess(session?.user?.role, UserRole.MASTER);

          if (!canModify) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  aria-label="더보기"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCredit(credit);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>수정</span>
                </DropdownMenuItem>
                {hasAccess(session?.user?.role, UserRole.SUPERMASTER) && (
                  <DropdownMenuItem
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!confirm("정말로 이 항목을 삭제하시겠습니까?"))
                        return;

                      setIsLoading(true);
                      try {
                        const result = await deleteCreditAction(credit.id);
                        if (result.success) {
                          toast({ title: "삭제 성공" });
                        } else {
                          throw new Error(result.error || "삭제 실패");
                        }
                      } catch (error) {
                        toast({
                          title: "삭제 실패",
                          description: "잠시 후 다시 시도해주세요",
                          variant: "destructive",
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>삭제</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
      toast({
        title: "선택된 항목이 없습니다.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await approveCreditAction(selectedIds);
      if (result.success && Array.isArray(result.data)) {
        result.data.forEach((item, index) => {
          if (item.result) {
            sonnerToast(`[${item.creditType}] 재화 지급/회수 승인 완료`, {
              id: `approve-${item.userId}-${item.creditType}-${Date.now()}`,
              description: (
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    대상자: {item.nickname} ({item.userId})
                  </p>
                  <p>재화 종류: {CREDIT_TYPE_MAP[item.creditType as string]}</p>
                  <p>변동 금액: {formatKoreanNumber(Number(item.amount))}원</p>
                  {typeof item.finalAmount === "number" &&
                    !isNaN(item.finalAmount) && (
                      <p>최종 금액: {formatKoreanNumber(item.finalAmount)}원</p>
                    )}
                </div>
              ),
              action: {
                label: "닫기",
                onClick: () =>
                  sonnerToast.dismiss(
                    `approve-${item.userId}-${item.creditType}-${Date.now()}`
                  ),
              },
              duration: 5000 + index * 500,
            });
          } else {
            toast({
              title: `[${item.creditType}] 승인 실패`,
              description: `사용자 ${item.nickname}(${item.userId})의 승인 처리 중 오류가 발생했습니다.`,
              variant: "destructive",
            });
          }
        });

        if (result.data.every((item) => !item.result)) {
          toast({
            title: "모든 항목 승인 실패",
            description: "선택된 모든 항목의 승인 처리에 실패했습니다.",
            variant: "destructive",
          });
        }
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
      table.resetRowSelection();
    }
  };

  const handleReject = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    if (!selectedIds.length) {
      toast({
        title: "선택된 항목이 없습니다.",
      });
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
      if (result.success && Array.isArray(result.data)) {
        let successCount = 0;
        result.data.forEach((item, index) => {
          if (item.result) {
            successCount++;
            sonnerToast(`[${item.creditType}] 재화 지급/회수 승인 완료`, {
              id: `bulk-approve-${item.userId}-${
                item.creditType
              }-${Date.now()}`,
              description: (
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    대상자: {item.nickname}({item.userId})
                  </p>
                  <p>재화 종류: {CREDIT_TYPE_MAP[item.creditType as string]}</p>
                  <p>변동 금액: {formatKoreanNumber(Number(item.amount))}원</p>
                  {typeof item.finalAmount === "number" &&
                    !isNaN(item.finalAmount) && (
                      <p>최종 금액: {formatKoreanNumber(item.finalAmount)}원</p>
                    )}
                </div>
              ),
              duration: 5000 + index * 500,
              action: {
                label: "닫기",
                onClick: () =>
                  sonnerToast.dismiss(
                    `bulk-approve-${item.userId}-${
                      item.creditType
                    }-${Date.now()}`
                  ),
              },
            });
          } else {
            toast({
              title: `[${item.creditType}] 전체 승인 중 실패`,
              description: `사용자 ${item.nickname}(${item.userId}) 처리 중 오류 발생`,
              variant: "destructive",
            });
          }
        });

        if (successCount === 0 && result.data.length > 0) {
          toast({
            title: "전체 승인 실패",
            description: "모든 항목의 승인 처리에 실패했습니다.",
            variant: "destructive",
          });
        } else if (successCount < result.data.length) {
          toast({
            title: "부분 성공",
            description: `${result.data.length}건 중 ${successCount}건만 성공적으로 승인되었습니다.`,
            variant: "default",
          });
        } else if (successCount === result.data.length && successCount > 0) {
          toast({
            title: "전체 승인 완료",
            description: `${successCount}건 모두 성공적으로 승인되었습니다.`,
          });
        }
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
      table.resetRowSelection();
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
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {isPending && hasAccess(session?.user?.role, "MASTER") && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={
                isLoading || table.getSelectedRowModel().rows.length === 0
              }
            >
              승인
            </Button>
            <Button size="sm" onClick={handleBulkApprove} disabled={isLoading}>
              전체 승인
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={
                isLoading || table.getSelectedRowModel().rows.length === 0
              }
            >
              거절
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkReject}
              disabled={isLoading}
            >
              전체 거절
            </Button>
            <Button
              size="sm"
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
        <div className="w-full flex justify-end items-center gap-2">
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            티켓 추가
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            disabled={isLoading || !table.getSelectedRowModel().rows.length}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV 다운로드
          </Button>
        </div>
      </div>

      <AddCreditDialog open={open} setOpen={setOpen} />
      {selectedCredit && (
        <EditCreditDialog
          open={isEditDialogOpen}
          setOpen={setIsEditDialogOpen}
          credit={selectedCredit}
          session={session}
        />
      )}
      <Table ref={tableContainerRef}>
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
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={(e) => {
                let newPage = parseInt(e.target.value);
                if (isNaN(newPage) || newPage < 1) {
                  newPage = 1;
                  setInputPage("1");
                } else if (newPage > data.metadata.totalPages) {
                  newPage = data.metadata.totalPages;
                  setInputPage(data.metadata.totalPages.toString());
                }
                handlePageChange(newPage);
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
