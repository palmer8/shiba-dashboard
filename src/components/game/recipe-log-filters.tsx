"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { RecipeLogFilter } from "@/types/log";
import { RotateCcw } from "lucide-react";
import { DateRange } from "react-day-picker";

interface RecipeLogFiltersProps {
  filters: RecipeLogFilter;
}

export function RecipeLogFilters({ filters }: RecipeLogFiltersProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<RecipeLogFilter>(filters);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );

  const handleFilterChange = useCallback(
    (key: keyof RecipeLogFilter, value: string | undefined) => {
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

    if (localFilter.userId) {
      searchParams.set("userId", localFilter.userId);
    }
    if (localFilter.recipeId) {
      searchParams.set("recipeId", localFilter.recipeId);
    }
    if (localFilter.rewardItem) {
      searchParams.set("rewardItem", localFilter.rewardItem);
    }
    if (dateRange?.from && dateRange?.to) {
      searchParams.set("startDate", dateRange.from.toISOString().split("T")[0]);
      searchParams.set("endDate", dateRange.to.toISOString().split("T")[0]);
    }

    router.push(`?${searchParams.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.replace("/log/recipe");
    setLocalFilter({ page: 1 });
    setDateRange(undefined);
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="userId">고유번호</Label>
          <Input
            id="userId"
            placeholder="고유번호 입력"
            value={localFilter.userId || ""}
            onChange={(e) => handleFilterChange("userId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipeId">레시피 ID</Label>
          <Input
            id="recipeId"
            placeholder="레시피 ID 입력"
            value={localFilter.recipeId || ""}
            onChange={(e) => handleFilterChange("recipeId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rewardItem">보상 아이템</Label>
          <Input
            id="rewardItem"
            placeholder="보상 아이템 입력"
            value={localFilter.rewardItem || ""}
            onChange={(e) => handleFilterChange("rewardItem", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>제작 일시</Label>
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
