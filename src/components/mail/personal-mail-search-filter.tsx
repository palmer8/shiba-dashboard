"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";
import { RotateCcw } from "lucide-react";
import { PersonalMailFilter } from "@/types/filters/mail-filter";

export function PersonalMailSearchFilter({
  filters,
}: {
  filters: PersonalMailFilter;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localFilter, setLocalFilter] = useState(filters);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );

  const handleFilterChange = useCallback(
    (key: keyof typeof filters, value: any) => {
      setLocalFilter((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString());
    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString());

    if (localFilter.reason) params.set("reason", localFilter.reason);
    if (localFilter.registrantUserId)
      params.set("registrantUserId", localFilter.registrantUserId.toString());
    if (localFilter.userId) params.set("userId", localFilter.userId.toString());

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
          <Label>등록일</Label>
          <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
        </div>

        <div className="space-y-2">
          <Label>사유</Label>
          <Input
            placeholder="사유 입력"
            value={localFilter.reason || ""}
            onChange={(e) => handleFilterChange("reason", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>작성자 고유번호</Label>
          <Input
            placeholder="작성자 고유번호 입력"
            value={localFilter.registrantUserId || ""}
            onChange={(e) =>
              handleFilterChange("registrantUserId", e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>고유번호</Label>
          <Input
            placeholder="고유번호 입력"
            value={localFilter.userId || ""}
            onChange={(e) => handleFilterChange("userId", e.target.value)}
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
