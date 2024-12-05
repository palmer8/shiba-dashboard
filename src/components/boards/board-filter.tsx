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
import { BoardFilter } from "@/types/board";

interface BoardFiltersProps {
  filters: BoardFilter;
}

export function BoardFilters({ filters }: BoardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localFilter, setLocalFilter] = useState<BoardFilter>(filters);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );

  const handleFilterChange = useCallback(
    (key: keyof BoardFilter, value: Date | string) => {
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

    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString());
    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString());
    if (localFilter.registrantId)
      params.set("registrantId", localFilter.registrantId);
    if (localFilter.title) params.set("title", localFilter.title);

    router.push(`/boards?${params.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.push("/boards");
    setLocalFilter({});
    setDateRange(undefined);
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>작성일</Label>
          <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
        </div>

        <div className="space-y-2">
          <Label>제목</Label>
          <Input
            placeholder="제목 입력"
            value={localFilter.title || ""}
            onChange={(e) => handleFilterChange("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>작성자 고유번호</Label>
          <Input
            placeholder="작성자 고유번호 입력"
            value={localFilter.registrantId || ""}
            onChange={(e) => handleFilterChange("registrantId", e.target.value)}
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
