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
import { CouponCodeLog } from "@/types/coupon";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { formatKoreanDateTime } from "@/lib/utils";
import Empty from "@/components/ui/empty";

interface CouponLogTableProps {
  data: {
    records: CouponCodeLog[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Expanded Row 컴포넌트
function CouponLogExpandedRow({ log }: { log: CouponCodeLog }) {
  if (!log.coupon) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          쿠폰 정보를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  const totalCodes = log.coupon._count?.codes || 0;
  const usedCodes = log.coupon._count?.usedCodes || 0;
  const usageRate = totalCodes > 0 ? ((usedCodes / totalCodes) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 쿠폰 기본 정보 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base">쿠폰 정보</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">쿠폰 ID:</span>
              <span className="ml-2 font-medium">{log.coupon.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">쿠폰명:</span>
              <span className="ml-2 font-medium">{log.coupon.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">타입:</span>
              <Badge
                className="ml-2"
                variant={log.coupon.type === "퍼블릭" ? "default" : "secondary"}
              >
                {log.coupon.type}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">사용 제한:</span>
              <span className="ml-2 font-medium">
                {log.coupon.maxcount ? `${log.coupon.maxcount}번` : "무제한"}
              </span>
            </div>
          </div>
        </div>

        {/* 사용 통계 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base">사용 통계</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">총 발급 수:</span>
              <span className="ml-2 font-medium">{totalCodes.toLocaleString()}개</span>
            </div>
            <div>
              <span className="text-muted-foreground">총 사용 수:</span>
              <span className="ml-2 font-medium">{usedCodes.toLocaleString()}개</span>
            </div>
            <div>
              <span className="text-muted-foreground">사용률:</span>
              <span className="ml-2 font-medium">{usageRate}%</span>
            </div>
          </div>
        </div>

        {/* 쿠폰 일정 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base">쿠폰 일정</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">시작일:</span>
              <span className="ml-2 font-medium">
                {formatKoreanDateTime(log.coupon.start_time)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">종료일:</span>
              <span className="ml-2 font-medium">
                {formatKoreanDateTime(log.coupon.end_time)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">생성일:</span>
              <span className="ml-2 font-medium">
                {formatKoreanDateTime(log.coupon.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 보상 아이템 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-base">보상 아이템</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(log.coupon.reward_items).map(([itemCode, itemInfo]) => (
            <div
              key={itemCode}
              className="p-3 bg-muted/50 rounded-lg border"
            >
              <div className="text-sm font-medium">{itemInfo.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{itemCode}</div>
              <div className="text-sm text-muted-foreground">수량: {itemInfo.amount.toLocaleString()}개</div>
            </div>
          ))}
        </div>
      </div>

      {/* 사용 정보 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-base">사용 정보</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">사용자 ID:</span>
              <span className="ml-2 font-medium">{log.user_id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">사용자 닉네임:</span>
              <span className="ml-2 font-medium">{log.nickname || "정보없음"}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">사용 코드:</span>
              <span className="ml-2 font-mono font-medium">{log.coupon_code}</span>
            </div>
            <div>
              <span className="text-muted-foreground">사용 시간:</span>
              <span className="ml-2 font-medium">{formatKoreanDateTime(log.time)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CouponLogTable({ data }: CouponLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const columns: ColumnDef<CouponCodeLog>[] = [
    {
      accessorKey: "user_id",
      header: "유저 ID",
    },
    {
      accessorKey: "nickname",
      header: "닉네임",
      cell: ({ row }) => row.original.nickname || "정보없음",
    },
    {
      accessorKey: "coupon_code",
      header: "쿠폰 코드",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.coupon_code}</span>
      ),
    },
    {
      accessorKey: "coupon.name",
      header: "쿠폰명",
      cell: ({ row }) => row.original.coupon?.name || "정보없음",
    },
    {
      accessorKey: "coupon.type",
      header: "타입",
      cell: ({ row }) => {
        if (!row.original.coupon) return "정보없음";
        return (
          <Badge
            variant={
              row.original.coupon.type === "퍼블릭" ? "default" : "secondary"
            }
          >
            {row.original.coupon.type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "time",
      header: "사용 일시",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatKoreanDateTime(row.original.time)}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: data.records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => true,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`/coupon/log?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <Table ref={tableContainerRef}>
        <TableHeader>
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
                  className="cursor-pointer hover:bg-muted/50"
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
                    <TableCell colSpan={columns.length} className="bg-muted/30">
                      <CouponLogExpandedRow log={row.original} />
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

      {data.records.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            총 {data.metadata.total.toLocaleString()}개 중{" "}
            {(data.metadata.page - 1) * 50 + 1}-
            {Math.min(data.metadata.page * 50, data.metadata.total)}개 표시
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.metadata.page - 1)}
              disabled={!data.metadata.hasPrev}
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
              disabled={!data.metadata.hasNext}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
