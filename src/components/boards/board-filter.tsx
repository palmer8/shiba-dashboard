"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
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
import { getCategoriesAction } from "@/actions/board-action";

interface BoardFiltersProps {
  filters: BoardFilter;
}

export function BoardFilters({ filters }: BoardFiltersProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [localFilter, setLocalFilter] = useState<BoardFilter>(filters);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategoriesAction();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    };
    loadCategories();
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof BoardFilter, value: string | null) => {
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

    if (localFilter.title && localFilter.title.trim()) {
      params.set("title", localFilter.title.trim());
    }

    if (localFilter.categoryId && localFilter.categoryId !== "ALL") {
      params.set("categoryId", localFilter.categoryId);
    }

    if (localFilter.registrantId && localFilter.registrantId.trim()) {
      params.set("registrantId", localFilter.registrantId.trim());
    }

    router.push(`/boards?${params.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.push("/boards");
    setLocalFilter({});
    setDateRange(undefined);
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>작성일</Label>
          <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
        </div>

        <div className="space-y-2">
          <Label>카테고리</Label>
          <Select
            value={localFilter.categoryId || "ALL"}
            onValueChange={(value) =>
              value === "ALL"
                ? handleFilterChange("categoryId", null)
                : handleFilterChange("categoryId", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
