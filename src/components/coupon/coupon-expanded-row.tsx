"use client";

import { CouponDisplay } from "@/types/coupon";
import { formatKoreanDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getCouponCodesAction } from "@/actions/coupon-action";
import { toast } from "@/hooks/use-toast";

interface CouponExpandedRowProps {
  coupon: CouponDisplay;
}

export function CouponExpandedRow({ coupon }: CouponExpandedRowProps) {
  const [showCodes, setShowCodes] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

  const handleLoadCodes = async () => {
    if (showCodes) {
      setShowCodes(false);
      return;
    }

    setLoadingCodes(true);
    try {
      const result = await getCouponCodesAction(coupon.id);
      if (result.success && result.data) {
        setCodes(result.data);
        setShowCodes(true);
      } else {
        toast({
          title: "쿠폰 코드 조회 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "쿠폰 코드 조회 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    } finally {
      setLoadingCodes(false);
    }
  };

  const totalCodes = coupon._count?.codes || 0;
  const usedCodes = coupon._count?.usedCodes || 0;
  const usageRate = totalCodes > 0 ? ((usedCodes / totalCodes) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 기본 정보 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base">기본 정보</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">쿠폰 ID:</span>
              <span className="ml-2 font-medium">{coupon.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">쿠폰명:</span>
              <span className="ml-2 font-medium">{coupon.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">타입:</span>
              <Badge
                className="ml-2"
                variant={coupon.type === "퍼블릭" ? "default" : "secondary"}
              >
                {coupon.type}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">사용 제한:</span>
              <span className="ml-2 font-medium">
                {coupon.maxcount ? `${coupon.maxcount}번` : "무제한"}
              </span>
            </div>
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base">사용 통계</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">발급 수:</span>
              <span className="ml-2 font-medium">{totalCodes.toLocaleString()}개</span>
            </div>
            {coupon.type === "퍼블릭" ? (
              <>
                <div>
                  <span className="text-muted-foreground">사용 수:</span>
                  <span className="ml-2 font-medium text-muted-foreground">-</span>
                </div>
                <div>
                  <span className="text-muted-foreground">사용률:</span>
                  <span className="ml-2 font-medium text-muted-foreground">-</span>
                </div>
                <div>
                  <span className="text-muted-foreground">잔여 수:</span>
                  <span className="ml-2 font-medium text-muted-foreground">-</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-muted-foreground">사용 수:</span>
                  <span className="ml-2 font-medium">{usedCodes.toLocaleString()}개</span>
                </div>
                <div>
                  <span className="text-muted-foreground">사용률:</span>
                  <span className="ml-2 font-medium">{usageRate}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">잔여 수:</span>
                  <span className="ml-2 font-medium">{(totalCodes - usedCodes).toLocaleString()}개</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 일정 정보 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base">일정 정보</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">시작일:</span>
              <span className="ml-2 font-medium">
                {formatKoreanDateTime(coupon.start_time)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">종료일:</span>
              <span className="ml-2 font-medium">
                {formatKoreanDateTime(coupon.end_time)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">생성일:</span>
              <span className="ml-2 font-medium">
                {formatKoreanDateTime(coupon.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 보상 아이템 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-base">보상 아이템</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(coupon.reward_items).map(([itemCode, count]) => (
            <div
              key={itemCode}
              className="p-3 bg-muted/50 rounded-lg border"
            >
              <div className="text-sm font-medium">{itemCode}</div>
              <div className="text-sm text-muted-foreground">수량: {count.toLocaleString()}개</div>
            </div>
          ))}
        </div>
      </div>

      {/* 쿠폰 코드 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-base">쿠폰 코드</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadCodes}
            disabled={loadingCodes}
          >
            {loadingCodes 
              ? "로딩 중..." 
              : showCodes 
                ? "코드 숨기기" 
                : `코드 보기 (${totalCodes}개)`
            }
          </Button>
        </div>
        
        {showCodes && (
          <div className="max-h-48 overflow-y-auto">
            {codes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {codes.map((code, index) => (
                  <div
                    key={index}
                    className="p-2 bg-muted rounded text-sm font-mono text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                생성된 코드가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 