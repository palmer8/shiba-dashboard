"use client";

import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { UserLogFilter as UserLogFilterType } from "@/types/game";

interface UserLogFilterProps {
  filter: UserLogFilterType;
}

export default function UserLogFilter({ filter }: UserLogFilterProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<UserLogFilterType>(filter);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filter.createdAt
      ? {
          from: new Date(filter.createdAt[0]),
          to: new Date(filter.createdAt[1]),
        }
      : undefined
  );

  const handleFilterChange = useCallback(
    (
      key: keyof UserLogFilterType,
      value: UserLogFilterType[keyof UserLogFilterType]
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

    if (localFilter.message) {
      searchParams.set("message", localFilter.message);
    }
    if (localFilter.level) {
      searchParams.set("level", localFilter.level);
    }
    if (localFilter.type) {
      searchParams.set("type", localFilter.type);
    }
    if (dateRange?.from && dateRange?.to) {
      const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
      };
      searchParams.set("startDate", formatDate(dateRange.from));
      searchParams.set("endDate", formatDate(dateRange.to));
    }

    router.replace(`?${searchParams.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.replace("/log/user");
    setLocalFilter({ page: 1 });
    setDateRange(undefined);
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="message">메시지</Label>
          <Input
            id="message"
            placeholder="메시지 입력"
            value={localFilter.message || ""}
            onChange={(e) => handleFilterChange("message", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">레벨</Label>
          <Input
            id="level"
            placeholder="레벨 입력"
            value={localFilter.level || ""}
            onChange={(e) => handleFilterChange("level", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">타입</Label>
          <Input
            id="type"
            placeholder="타입 입력"
            value={localFilter.type || ""}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>등록 일시</Label>
          <DatePickerWithRange date={dateRange} onSelect={handleDateChange} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6">
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </Button>
        <Button onClick={handleSearch} size="sm">
          조회
        </Button>
      </div>
    </>
  );
}
