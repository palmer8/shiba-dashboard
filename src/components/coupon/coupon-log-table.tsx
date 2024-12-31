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
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { formatKoreanDateTime } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import Empty from "@/components/ui/empty";
import { Download } from "lucide-react";
import { handleDownloadJson2CSV } from "@/lib/utils";
import { getCouponLogByIdsOrigin } from "@/actions/coupon-action";
import { CouponLog } from "@/types/coupon";
import { toast } from "@/hooks/use-toast";

interface CouponLogTableProps {
  data: {
    records: CouponLog[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
}

export function CouponLogTable({ data }: CouponLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo<ColumnDef<CouponLog>[]>(
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
        accessorKey: "userId",
        header: "유저 ID",
      },
      {
        accessorKey: "nickname",
        header: "닉네임",
      },
      {
        accessorKey: "coupon.code",
        header: "쿠폰 코드",
        cell: ({ row }) => row.original.coupon?.code || "-",
      },
      {
        accessorKey: "coupon.couponGroup.groupName",
        header: "쿠폰 그룹",
        cell: ({ row }) => row.original.coupon?.couponGroup?.groupName || "-",
      },
      {
        accessorKey: "usedAt",
        header: "사용 일시",
        cell: ({ row }) => formatKoreanDateTime(row.original.usedAt),
      },
    ],
    []
  );

  const table = useReactTable({
    data: data.records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
      const result = await getCouponLogByIdsOrigin(selectedIds);
      if (result.success && result.data) {
        handleDownloadJson2CSV({
          data: result.data,
          fileName: "coupon_logs",
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
      <div className="flex items-center justify-end gap-2">
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
