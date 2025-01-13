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
} from "@tanstack/react-table";
import { CouponGroup, CouponGroupList } from "@/types/coupon";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useState, useEffect } from "react";
import { ExpandedCouponRow } from "./expanded-coupon-row";
import { Badge } from "@/components/ui/badge";
import {
  formatKoreanDateTime,
  handleDownloadMultipleJson2CSV,
  hasAccess,
} from "@/lib/utils";
import AddCouponDialog from "@/components/dialog/add-coupon-dialog";
import {
  createCouponsAction,
  deleteCouponGroupWithCouponsAction,
  getCouponGroupWithCouponsAndIdsAction,
} from "@/actions/coupon-action";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal,
  Trash,
  Edit2,
  Download,
  Plus,
  BookDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Prisma, UserRole } from "@prisma/client";
import EditCouponDialog from "@/components/dialog/edit-coupon-dialog";
import Empty from "@/components/ui/empty";
import { Session } from "next-auth";

interface CouponTableProps {
  data: CouponGroupList;
  page: number;
  session: Session;
}

export function CouponTable({ data, page, session }: CouponTableProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<CouponGroup | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState((page + 1).toString());

  useEffect(() => {
    setInputPage((page + 1).toString());
  }, [page]);

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
    {
      id: "actions",
      cell: ({ row }) => {
        const canModify = hasAccess(session?.user?.role, UserRole.SUPERMASTER);

        if (!canModify) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCoupon(row.original);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                <span>수정</span>
              </DropdownMenuItem>
              {hasAccess(session?.user?.role, UserRole.SUPERMASTER) && (
                <DropdownMenuItem
                  onClick={async () => {
                    if (
                      confirm(
                        "정말로 이 쿠폰 그룹을 삭제하시겠습니까?\n쿠폰도 모두 삭제됩니다."
                      )
                    ) {
                      const result = await deleteCouponGroupWithCouponsAction(
                        row.original.id
                      );
                      if (result) {
                        toast({
                          title: "쿠폰 그룹 삭제 완료",
                        });
                      }
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
        title: `${selectedGroups.length}개의 그룹에 쿠폰 발급 완료`,
      });
    } else {
      toast({
        title: "쿠폰 발급 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  async function handleDownloadCSV() {
    const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
    const result = await getCouponGroupWithCouponsAndIdsAction(ids);
    if (result.success && result.data) {
      handleDownloadMultipleJson2CSV([
        { data: result.data.groups, fileName: "coupon-groups" },
        { data: result.data.coupons, fileName: "coupons" },
      ]);
      toast({
        title: "CSV 다운로드 성공",
      });
    } else {
      toast({
        title: "CSV 다운로드 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          onClick={handleDownloadCSV}
          disabled={!table.getSelectedRowModel().rows.length}
          className="gap-2"
          size="sm"
        >
          <Download className="h-4 w-4" />
          CSV 다운로드
        </Button>
        <Button
          size="sm"
          disabled={table.getSelectedRowModel().rows.length === 0}
          onClick={handleIssueCoupon}
          className="gap-2"
        >
          <BookDown className="h-4 w-4" />
          쿠폰 발급
        </Button>
        <Button onClick={() => setOpen(true)} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          추가
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    !row.original.isIssued && "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => row.toggleExpanded()}
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {data.metadata.totalCount.toLocaleString()}개 중 {page * 50 + 1}-
          {Math.min((page + 1) * 50, data.metadata.totalCount)}개 표시
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
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={(e) => {
                let newPage = parseInt(e.target.value) - 1;
                if (isNaN(newPage) || newPage < 0) {
                  newPage = 0;
                  setInputPage("1");
                } else if (newPage >= data.metadata.totalPages) {
                  newPage = data.metadata.totalPages - 1;
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
            onClick={() => handlePageChange(page + 1)}
            disabled={!data || page >= data.metadata.totalPages - 1}
          >
            다음
          </Button>
        </div>
      </div>

      <AddCouponDialog open={open} setOpen={setOpen} />
      {selectedCoupon && (
        <EditCouponDialog
          open={isEditDialogOpen}
          setOpen={setIsEditDialogOpen}
          couponGroup={selectedCoupon}
        />
      )}
    </div>
  );
}
