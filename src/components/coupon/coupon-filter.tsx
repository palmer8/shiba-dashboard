"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";
import { RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CouponFilter } from "@/types/coupon";

interface CouponFiltersProps {
  filters: CouponFilter;
}

export function CouponFilters({ filters }: CouponFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localFilter, setLocalFilter] = useState<CouponFilter>(filters);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );

  const handleFilterChange = useCallback(
    (key: keyof CouponFilter, value: any) => {
      setLocalFilter((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", "0");

    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString());
    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString());
    if (localFilter.groupStatus)
      params.set("groupStatus", localFilter.groupStatus);
    if (localFilter.groupType) params.set("groupType", localFilter.groupType);
    if (localFilter.groupReason)
      params.set("groupReason", localFilter.groupReason);

    router.push(`/coupon?${params.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.push("/coupon");
    setLocalFilter({});
    setDateRange(undefined);
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>발급 기간</Label>
          <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
        </div>

        <div className="space-y-2">
          <Label>상태</Label>
          <Select
            value={localFilter.groupStatus}
            onValueChange={(value) => handleFilterChange("groupStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">활성</SelectItem>
              <SelectItem value="INACTIVE">비활성</SelectItem>
              <SelectItem value="EXPIRED">만료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>타입</Label>
          <Select
            value={localFilter.groupType}
            onValueChange={(value) => handleFilterChange("groupType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="타입 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="COMMON">일반</SelectItem>
              <SelectItem value="PUBLIC">퍼블릭</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>사유</Label>
          <Input
            placeholder="사유 입력"
            value={localFilter.groupReason || ""}
            onChange={(e) => handleFilterChange("groupReason", e.target.value)}
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
