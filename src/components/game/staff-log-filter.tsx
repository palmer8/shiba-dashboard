"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { RotateCcw } from "lucide-react";
import { StaffLogFilter } from "@/types/log";

interface StaffLogFiltersProps {
  filters: StaffLogFilter;
}

export function StaffLogFilters({ filters }: StaffLogFiltersProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<StaffLogFilter>(filters);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );

  const handleFilterChange = useCallback(
    (key: keyof StaffLogFilter, value: string | null) => {
      setLocalFilter((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", "1");

    if (dateRange?.from) {
      params.set("startDate", dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      params.set("endDate", dateRange.to.toISOString());
    }

    if (localFilter.staffId) {
      params.set("staffId", localFilter.staffId);
    }

    if (localFilter.targetId) {
      params.set("targetId", localFilter.targetId);
    }

    router.push(`/log/staff?${params.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.push("/log/staff");
    setLocalFilter({});
    setDateRange(undefined);
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>처리일시</Label>
          <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
        </div>

        <div className="space-y-2">
          <Label>스태프 ID</Label>
          <Input
            placeholder="스태프 ID 입력"
            value={localFilter.staffId || ""}
            onChange={(e) => handleFilterChange("staffId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>대상자 ID</Label>
          <Input
            placeholder="대상자 ID 입력"
            value={localFilter.targetId || ""}
            onChange={(e) => handleFilterChange("targetId", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </Button>
        <Button size="sm" onClick={handleSearch}>
          조회
        </Button>
      </div>
    </div>
  );
}
