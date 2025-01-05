"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { AdminLogFilters } from "@/types/log";
import { RotateCcw } from "lucide-react";
import { DateRange } from "react-day-picker";

interface AdminLogFilterProps {
  filter: AdminLogFilters;
}

export default function AdminLogFilter({ filter }: AdminLogFilterProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<AdminLogFilters>(filter);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filter.date ? { from: filter.date[0], to: filter.date[1] } : undefined
  );

  const handleFilterChange = useCallback(
    (
      key: keyof AdminLogFilters,
      value: AdminLogFilters[keyof AdminLogFilters]
    ) => {
      setLocalFilter((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleDateChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
  }, []);

  const handleSearch = useCallback(() => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", "1");

    if (localFilter.content) {
      searchParams.set("content", localFilter.content);
    }
    if (localFilter.registrantUserId) {
      searchParams.set(
        "registrantUserId",
        localFilter.registrantUserId.toString()
      );
    }
    if (dateRange?.from && dateRange?.to) {
      searchParams.set("fromDate", dateRange.from.toISOString());
      searchParams.set("toDate", dateRange.to.toISOString());
    }

    router.push(`?${searchParams.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.replace("/admin/log");
    setLocalFilter({ page: 1 });
    setDateRange(undefined);
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="content">메시지</Label>
          <Input
            id="content"
            placeholder="메시지 검색"
            value={localFilter.content || ""}
            onChange={(e) => handleFilterChange("content", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrantUserId">등록자 고유번호</Label>
          <Input
            id="registrantUserId"
            type="number"
            placeholder="등록자 고유번호"
            value={localFilter.registrantUserId || ""}
            onChange={(e) =>
              handleFilterChange(
                "registrantUserId",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>

        <div className="space-y-2">
          <Label>등록 일시</Label>
          <DatePickerWithRange date={dateRange} onSelect={handleDateChange} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="gap-2"
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </Button>
        <Button onClick={handleSearch} size="sm">
          검색
        </Button>
      </div>
    </div>
  );
}
