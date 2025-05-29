"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";
import { RotateCcw } from "lucide-react";
import { GroupMailReserveLogFilter } from "@/types/mail";

interface GroupMailLogSearchFilterProps {
  filters: GroupMailReserveLogFilter;
}

export function GroupMailLogSearchFilter({ filters }: GroupMailLogSearchFilterProps) {
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
    eventId: filters.eventId?.toString() || "",
    userId: filters.userId?.toString() || "",
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

    // 이벤트 ID 필터 적용
    if (localFilter.eventId) {
      params.set("eventId", localFilter.eventId);
    } else {
      params.delete("eventId");
    }

    // 유저 ID 필터 적용
    if (localFilter.userId) {
      params.set("userId", localFilter.userId);
    } else {
      params.delete("userId");
    }
    
    // 날짜 범위 필터 적용 (둘 다 선택되었을 때만)
    if (dateRange?.from && dateRange?.to) {
      params.set("startDate", dateRange.from.toISOString().split('T')[0]);
      params.set("endDate", dateRange.to.toISOString().split('T')[0]);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }

    router.replace(`/game/mail/group-log?${params.toString()}`);
  }, [localFilter, dateRange, router, searchParams]);

  const handleReset = useCallback(() => {
    setLocalFilter({
      eventId: "",
      userId: "",
    });
    setDateRange(undefined);
    
    router.replace("/game/mail/group-log");
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="eventId">이벤트 ID</Label>
          <Input
            id="eventId"
            type="number"
            placeholder="이벤트 ID 입력"
            value={localFilter.eventId}
            onChange={(e) => handleFilterChange("eventId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userId">유저 ID</Label>
          <Input
            id="userId"
            type="number"
            placeholder="유저 ID 입력"
            value={localFilter.userId}
            onChange={(e) => handleFilterChange("userId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>수령일 범위</Label>
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