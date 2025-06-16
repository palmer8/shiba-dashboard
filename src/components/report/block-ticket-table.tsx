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
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, Fragment, useEffect, useRef } from "react";
import { BlockTicket, RewardRevoke, UserRole } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  approveAllBlockTicketAction,
  approveBlockTicketAction,
  rejectBlockTicketAction,
  rejectAllBlockTicketAction,
  deleteBlockTicketAction,
} from "@/actions/report-action";
import { toast } from "@/hooks/use-toast";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Session } from "next-auth";
import Empty from "../ui/empty";

interface BlockTicketTableProps {
  data: {
    records: (BlockTicket & {
      registrant: { id: string; nickname: string; userId: number };
      approver?: { id: string; nickname: string; userId: number } | null;
    })[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
  session: Session;
}

export function BlockTicketTable({ data, session }: BlockTicketTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
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

  const columns = useMemo<ColumnDef<any>[]>(
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
            onClick={(e) => e.stopPropagation()}
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
        header: "사유",
        accessorKey: "reason",
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate"
            title={row.original.report?.reason}
          >
            {row.original.report?.reason}
          </div>
        ),
      },
      {
        header: "대상자",
        accessorKey: "targetUserId",
        cell: ({ row }) => (
          <span>
            {row.original.report?.target_user_nickname} (
            {row.original.report?.target_user_id})
          </span>
        ),
      },
      {
        header: "신고자",
        accessorKey: "reportingUserId",
        cell: ({ row }) => (
          <span>
            {row.original.report?.reporting_user_id
              ? `${row.original.report?.reporting_user_nickname} (${row.original.report?.reporting_user_id})`
              : "정보없음"}
          </span>
        ),
      },
      {
        header: "처리자",
        accessorKey: "userId",
        cell: ({ row }) => (
          <span>
            {row.original.registrant?.nickname} (
            {row.original.registrant?.userId})
          </span>
        ),
      },
      {
        header: "승인자",
        accessorKey: "approverId",
        cell: ({ row }) => (
          <span>
            {row.original.approver ? (
              `${row.original.approver.nickname} (${row.original.approver.userId})`
            ) : (
              <span className="text-muted-foreground">정보없음</span>
            )}
          </span>
        ),
      },
      {
        header: "등록일자",
        accessorKey: "createdAt",
        cell: ({ row }) => formatKoreanDateTime(row.original.createdAt),
      },
      {
        header: "승인일자",
        accessorKey: "approvedAt",
        cell: ({ row }) =>
          row.original.approvedAt
            ? formatKoreanDateTime(row.original.createdAt)
            : "정보없음",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: Row<RewardRevoke> }) => {
          return (
            hasAccess(session?.user!.role, UserRole.MASTER) && (
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
                        const result = await deleteBlockTicketAction(
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
    router.push(`?${params.toString()}`, { scroll: false });
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
          title: "승인 성공",
        });
      } else {
        toast({
          title: "승인 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
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
          title: "거절 성공",
        });
      } else {
        toast({
          title: "거절 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
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
        });
      } else {
        toast({
          title: "전체 승인 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
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
        });
      } else {
        toast({
          title: "전체 거절 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
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
              <Fragment key={row.id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => {
                    row.toggleExpanded();
                  }}
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
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="bg-muted/30">
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-background/50 rounded-lg">
                            <h4 className="text-sm font-semibold mb-2">대상자 정보</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">고유번호:</span>
                                <span className="font-medium">
                                  {row.original.report?.target_user_id || "정보 없음"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">닉네임:</span>
                                <span className="font-medium">
                                  {row.original.report?.target_user_nickname || "정보 없음"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-background/50 rounded-lg">
                            <h4 className="text-sm font-semibold mb-2">신고자 정보</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">고유번호:</span>
                                <span className="font-medium">
                                  {row.original.report?.reporting_user_id || "정보 없음"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">닉네임:</span>
                                <span className="font-medium">
                                  {row.original.report?.reporting_user_nickname || "정보 없음"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-background/50 rounded-lg">
                          <h4 className="text-sm font-semibold mb-2">상세 내용</h4>
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {row.original.report?.incident_description || "정보 없음"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
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
