"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";
import { RotateCcw } from "lucide-react";

interface CouponLogFilterProps {
  filters: {
    userId?: number;
    nickname?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function CouponLogFilter({ filters }: CouponLogFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localFilter, setLocalFilter] = useState(filters);

  // 사용일 날짜 범위
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );

  const handleFilterChange = useCallback((key: string, value: any) => {
    setLocalFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    // 날짜 범위
    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString());
    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString());

    // 유저 정보
    if (localFilter.userId) params.set("userId", localFilter.userId.toString());
    if (localFilter.nickname) params.set("nickname", localFilter.nickname);

    router.push(`?${params.toString()}`);
  }, [localFilter, dateRange, router, searchParams]);

  const handleReset = useCallback(() => {
    router.push("?page=1");
    setLocalFilter({});
    setDateRange(undefined);
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>사용일</Label>
          <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
        </div>

        <div className="space-y-2">
          <Label>유저 ID</Label>
          <Input
            placeholder="유저 ID 입력"
            value={localFilter.userId || ""}
            onChange={(e) =>
              handleFilterChange("userId", Number(e.target.value))
            }
            type="number"
          />
        </div>

        <div className="space-y-2">
          <Label>닉네임</Label>
          <Input
            placeholder="닉네임 입력"
            value={localFilter.nickname || ""}
            onChange={(e) => handleFilterChange("nickname", e.target.value)}
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
