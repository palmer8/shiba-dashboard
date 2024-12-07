"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";
import { RotateCcw } from "lucide-react";
import { ItemQuantityFilter } from "@/types/filters/quantity-filter";

interface ItemQuantitySearchFilterProps {
  filters: Omit<ItemQuantityFilter, "status">;
}

export function ItemQuantitySearchFilter({
  filters,
}: ItemQuantitySearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localFilter, setLocalFilter] =
    useState<Omit<ItemQuantityFilter, "status">>(filters);

  // 등록일 날짜 범위
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );

  // 승인일 날짜 범위
  const [approveDateRange, setApproveDateRange] = useState<
    DateRange | undefined
  >(
    filters.approveStartDate && filters.approveEndDate
      ? {
          from: new Date(filters.approveStartDate),
          to: new Date(filters.approveEndDate),
        }
      : undefined
  );

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    // 현재 status 값 유지
    const currentStatus = searchParams.get("status");
    if (currentStatus) params.set("status", currentStatus);

    // 등록일 날짜 범위
    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString());
    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString());

    // 승인일 날짜 범위
    if (approveDateRange?.from)
      params.set("approveStartDate", approveDateRange.from.toISOString());
    if (approveDateRange?.to)
      params.set("approveEndDate", approveDateRange.to.toISOString());

    if (localFilter.userId) params.set("userId", localFilter.userId.toString());

    router.push(`?${params.toString()}`);
  }, [localFilter, dateRange, approveDateRange, router, searchParams]);

  const handleReset = useCallback(() => {
    const params = new URLSearchParams();
    // status만 유지하고 나머지 초기화
    const currentStatus = searchParams.get("status");
    if (currentStatus) params.set("status", currentStatus);

    router.push(`?${params.toString()}`);
    setLocalFilter({});
    setDateRange(undefined);
    setApproveDateRange(undefined);
  }, [router, searchParams]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>등록일</Label>
          <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
        </div>

        <div className="space-y-2">
          <Label>승인일</Label>
          <DatePickerWithRange
            date={approveDateRange}
            onSelect={setApproveDateRange}
          />
        </div>

        <div className="space-y-2">
          <Label>고유번호</Label>
          <Input
            placeholder="고유번호 입력"
            value={localFilter.userId || ""}
            onChange={(e) =>
              setLocalFilter((prev) => ({
                ...prev,
                userId: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            type="number"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          초기화
        </Button>
        <Button onClick={handleSearch}>조회</Button>
      </div>
    </div>
  );
}
