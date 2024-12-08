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
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { CouponGroup } from "@/types/coupon";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";
import { ExpandedCouponRow } from "./expanded-coupon-row";
import { Badge } from "@/components/ui/badge";
import { formatKoreanDateTime } from "@/lib/utils";
import AddCouponDialog from "@/components/dialog/add-coupon-dialog";
import {
  createCouponsAction,
  deleteCouponGroupWithCouponsAction,
} from "@/actions/coupon-action";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { MoreHorizontal, Trash, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Prisma } from "@prisma/client";
import EditCouponDialog from "@/components/dialog/edit-coupon-dialog";

interface CouponTableProps {
  data: {
    couponGroups: CouponGroup[];
    count: number;
    totalPages: number;
  };
  page: number;
}

export function CouponTable({ data, page }: CouponTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const columns: ColumnDef<CouponGroup>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "groupName",
      header: "그룹명",
    },
    {
      accessorKey: "groupType",
      header: "타입",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.groupType === "PUBLIC" ? "default" : "secondary"
          }
        >
          {row.original.groupType === "PUBLIC" ? "퍼블릭" : "일반"}
        </Badge>
      ),
    },
    {
      accessorKey: "groupReason",
      header: "사유",
    },
    {
      accessorKey: "code",
      header: "코드",
      cell: ({ row }) => row.original.code || "-",
    },
    {
      accessorKey: "quantity",
      header: "수량",
      cell: ({ row }) =>
        row.original.quantity
          ? row.original.quantity.toLocaleString() + "개"
          : "무제한",
    },
    {
      accessorKey: "usageLimit",
      header: "사용 제한",
      cell: ({ row }) =>
        row.original.usageLimit?.toLocaleString() + "번" || "무제한",
    },
    {
      accessorKey: "startDate",
      header: "시작일",
      cell: ({ row }) => formatKoreanDateTime(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      header: "종료일",
      cell: ({ row }) => formatKoreanDateTime(row.original.endDate),
    },
    {
      accessorKey: "isIssued",
      header: "발급 여부",
      cell: ({ row }) => (
        <Badge variant={row.original.isIssued ? "default" : "outline"}>
          {row.original.isIssued ? "발급됨" : "미발급"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "생성일",
      cell: ({ row }) => formatKoreanDateTime(row.original.createdAt),
    },
    ...(session?.user?.role === "SUPERMASTER"
      ? [
          {
            id: "actions",
            header: "관리",
            cell: ({ row }: { row: Row<CouponGroup> }) => {
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <EditCouponDialog
                      initialData={row.original}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>수정</span>
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            `정말로 이 쿠폰 그룹을 삭제하시겠습니까?\n쿠폰도 모두 삭제됩니다.`
                          )
                        ) {
                          const result =
                            await deleteCouponGroupWithCouponsAction(
                              row.original.id
                            );
                          if (result) {
                            toast({
                              title:
                                "쿠폰 그룹과 쿠폰이 성공적으로 삭제되었습니다.",
                            });
                          } else {
                            toast({
                              title: "쿠폰 그룹과 쿠폰 삭제에 실패하였습니다.",
                              description: "잠시 후에 다시 시도해주세요",
                              variant: "destructive",
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
              );
            },
          },
        ]
      : []),
  ];

  const table = useReactTable({
    data: data.couponGroups,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/coupon?${params.toString()}`);
  };

  const handleIssueCoupon = async () => {
    const selectedGroups = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    const result = await createCouponsAction(selectedGroups);
    if (result.success) {
      toast({
        title: `${selectedGroups.length}개의 그룹에 쿠폰이 발급되었습니다.`,
      });
    } else {
      toast({
        title: "쿠폰 발급에 실패하였습니다.",
        description: result.message,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2">
        <AddCouponDialog open={open} setOpen={setOpen} />
        <Button
          disabled={table.getSelectedRowModel().rows.length === 0}
          onClick={handleIssueCoupon}
        >
          쿠폰 발급
        </Button>
        <Button
          disabled={table.getSelectedRowModel().rows.length === 0}
          //   onClick={handleIssueCoupon}
        >
          CSV 다운로드
        </Button>
      </div>
      <Table>
        <TableHeader className="z-20">
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
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  !row.original.isIssued && "cursor-not-allowed opacity-50"
                )}
                onClick={() => {
                  {
                    setExpandedRows((prev) => ({
                      ...prev,
                      [row.id]: !prev[row.id],
                    }));
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {expandedRows[row.id] && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="bg-muted/30 p-0"
                  >
                    {row.original.isIssued && (
                      <ExpandedCouponRow
                        couponGroup={row.original}
                        rewards={row.original.rewards as Prisma.JsonArray}
                      />
                    )}
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {data.count.toLocaleString()}개 중 {page * 50 + 1}-
          {Math.min((page + 1) * 50, data.count)}개 표시
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
          >
            이전
          </Button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={page + 1}
              onChange={(e) => {
                const newPage = parseInt(e.target.value) - 1;
                if (newPage >= 0) {
                  handlePageChange(newPage);
                }
              }}
              className="w-12 rounded-md border border-input bg-background px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
            />
            <span className="text-sm text-muted-foreground">
              / {data.totalPages || 1}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={!data || data.couponGroups.length < 50}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
