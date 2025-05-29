"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { RotateCcw } from "lucide-react";
import type { CouponLogFilter as CouponLogFilterType } from "@/types/coupon";
import { DateRange } from "react-day-picker";

interface CouponLogFiltersProps {
  filters: CouponLogFilterType;
}

export function CouponLogFilter({ filters }: CouponLogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 날짜 범위 상태 초기화
  const initDateRange = (): DateRange | undefined => {
    if (filters.startDate && filters.endDate) {
      return {
        from: new Date(filters.startDate),
        to: new Date(filters.endDate),
      };
    }
    return undefined;
  };
  
  const [localFilters, setLocalFilters] = useState({
    userId: filters.userId?.toString() || "",
    couponCode: filters.couponCode || "",
  });
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initDateRange());

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setLocalFilters(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 페이지를 1로 리셋
    params.set("page", "1");
    
    // 기본 필터 적용
    if (localFilters.userId) {
      params.set("userId", localFilters.userId);
    } else {
      params.delete("userId");
    }
    
    if (localFilters.couponCode) {
      params.set("couponCode", localFilters.couponCode);
    } else {
      params.delete("couponCode");
    }
    
    // 날짜 범위 필터 적용
    if (dateRange?.from && dateRange?.to) {
      params.set("startDate", dateRange.from.toISOString().split('T')[0]);
      params.set("endDate", dateRange.to.toISOString().split('T')[0]);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }

    router.replace(`/coupon/log?${params.toString()}`);
  }, [localFilters, dateRange, router, searchParams]);

  const handleReset = useCallback(() => {
    setLocalFilters({
      userId: "",
      couponCode: "",
    });
    setDateRange(undefined);
    
    router.replace("/coupon/log");
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="userId">유저 ID</Label>
          <Input
            id="userId"
            type="number"
            placeholder="유저 ID 입력"
            value={localFilters.userId}
            onChange={(e) => handleFilterChange("userId", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="couponCode">쿠폰 코드</Label>
          <Input
            id="couponCode"
            placeholder="쿠폰 코드 입력"
            value={localFilters.couponCode}
            onChange={(e) => handleFilterChange("couponCode", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>날짜 범위</Label>
          <DatePickerWithRange
            date={dateRange}
            onSelect={setDateRange}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-6">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          초기화
        </Button>
        <Button onClick={handleSearch}>조회</Button>
      </div>
    </>
  );
}
