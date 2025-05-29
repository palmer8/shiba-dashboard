"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";
import { RotateCcw } from "lucide-react";
import { GroupMailReserveFilter } from "@/types/mail";

interface GroupMailSearchFilterProps {
  filters: GroupMailReserveFilter;
}

export function GroupMailSearchFilter({ filters }: GroupMailSearchFilterProps) {
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
  
  const [localFilter, setLocalFilter] = useState({
    title: filters.title || "",
  });
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initDateRange());

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setLocalFilter((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 페이지를 1로 리셋
    params.set("page", "1");

    // 제목 필터 적용
    if (localFilter.title) {
      params.set("title", localFilter.title);
    } else {
      params.delete("title");
    }
    
    // 날짜 범위 필터 적용 (둘 다 선택되었을 때만)
    if (dateRange?.from && dateRange?.to) {
      params.set("startDate", dateRange.from.toISOString().split('T')[0]);
      params.set("endDate", dateRange.to.toISOString().split('T')[0]);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }

    router.replace(`/game/group-mail?${params.toString()}`);
  }, [localFilter, dateRange, router, searchParams]);

  const handleReset = useCallback(() => {
    setLocalFilter({
      title: "",
    });
    setDateRange(undefined);
    
    router.replace("/game/group-mail");
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            placeholder="제목 입력"
            value={localFilter.title}
            onChange={(e) => handleFilterChange("title", e.target.value)}
          />
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
