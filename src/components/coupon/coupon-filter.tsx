"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { RotateCcw } from "lucide-react";
import { CouponFilter } from "@/types/coupon";
import { DateRange } from "react-day-picker";

interface CouponFiltersProps {
  filters: CouponFilter;
}

export function CouponFilters({ filters }: CouponFiltersProps) {
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
    name: filters.name || "",
    type: filters.type || "ALL",
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
    
    // 페이지를 0으로 리셋
    params.set("page", "0");
    
    // 기본 필터 적용
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // 날짜 범위 필터 적용
    if (dateRange?.from && dateRange?.to) {
      params.set("startDate", dateRange.from.toISOString().split('T')[0]);
      params.set("endDate", dateRange.to.toISOString().split('T')[0]);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }

    router.replace(`/coupon?${params.toString()}`);
  }, [localFilters, dateRange, router, searchParams]);

  const handleReset = useCallback(() => {
    setLocalFilters({
      name: "",
      type: "ALL",
    });
    setDateRange(undefined);
    
    router.replace("/coupon");
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="name">쿠폰명</Label>
          <Input
            id="name"
            placeholder="쿠폰명 검색"
            value={localFilters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">쿠폰 타입</Label>
          <Select
            value={localFilters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="타입 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="일반">일반</SelectItem>
              <SelectItem value="퍼블릭">퍼블릭</SelectItem>
            </SelectContent>
          </Select>
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
