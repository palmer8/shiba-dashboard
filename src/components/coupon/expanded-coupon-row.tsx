"use client";

import { useEffect, useState } from "react";
import { Coupon, Prisma } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCouponsByGroupIdAction } from "@/actions/coupon-action";
import { Button } from "@/components/ui/button";
import { CouponGroup } from "@/types/coupon";
import { LoadingBar } from "../global/loading";

interface ExpandedCouponRowProps {
  couponGroup: CouponGroup;
  rewards: Prisma.JsonArray;
}

export function ExpandedCouponRow({
  couponGroup,
  rewards,
}: ExpandedCouponRowProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        if (couponGroup.groupType === "COMMON" && couponGroup.isIssued) {
          const result = await getCouponsByGroupIdAction(couponGroup.id, page);
          if (result.success && result.data) {
            setCoupons(result.data.coupons);
            setTotalPages(result.data.metadata.totalPages);
            setTotal(result.data.metadata.totalCount);
          }
        }
      } catch (error) {
        setCoupons([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [couponGroup.id, page, couponGroup.isIssued, couponGroup.groupType]);

  return (
    <div className="grid">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>아이템 ID</TableHead>
            <TableHead>아이템 이름</TableHead>
            <TableHead>수량</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(rewards as Array<{ id: string; name: string; count: number }>).map(
            (reward, index) => (
              <TableRow key={index}>
                <TableCell>{reward.id}</TableCell>
                <TableCell>{reward.name}</TableCell>
                <TableCell>{reward.count}개</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>

      {isLoading ? (
        <div className="p-1 flex justify-center items-center h-[60px]">
          <LoadingBar />
        </div>
      ) : (
        couponGroup.isIssued &&
        couponGroup.groupType === "COMMON" && (
          <div className="grid gap-4">
            <Table className="max-h-[100px] overflow-y-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="static">쿠폰 코드</TableHead>
                  <TableHead className="static">발급 여부</TableHead>
                  <TableHead className="static">생성일자</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>{coupon.code ?? "-"}</TableCell>
                    <TableCell>{coupon.isUsed ? "사용됨" : "미사용"}</TableCell>
                    <TableCell>
                      {new Date(coupon.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between py-2">
              <div className="text-sm text-muted-foreground">
                총 {total}개 중 {page * 100 + 1}-
                {Math.min((page + 1) * 100, total)}개 표시
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
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
                      if (newPage >= 0 && newPage < totalPages) {
                        setPage(newPage);
                      }
                    }}
                    className="w-12 rounded-md border border-input px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={1}
                    max={totalPages}
                  />
                  <span className="text-sm text-muted-foreground">
                    / {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  다음
                </Button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
