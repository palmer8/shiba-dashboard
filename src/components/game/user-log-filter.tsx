"use client";

import { Input } from "@/components/ui/input";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw, Loader2 } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { UserLogFilter as UserLogFilterType } from "@/types/game";
import { toast } from "@/hooks/use-toast";

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
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsSearching(true);

    const timeoutId = setTimeout(() => {
      try {
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
            return `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          };
          searchParams.set("startDate", formatDate(dateRange.from));
          searchParams.set("endDate", formatDate(dateRange.to));
        }

        router.replace(`?${searchParams.toString()}`);
      } catch (error) {
        toast({
          title: "검색 중 오류가 발생했습니다.",
          description: "잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
        setIsSubmitting(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilter, dateRange, router, isSubmitting]);

  const handleReset = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      router.replace("/log/user");
      setLocalFilter({ page: 1 });
      setDateRange(undefined);
    } catch (error) {
      toast({
        title: "초기화 중 오류가 발생했습니다.",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [router, isSubmitting]);

  // 엔터키 처리
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

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
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">레벨</Label>
          <Input
            id="level"
            placeholder="레벨 입력"
            value={localFilter.level || ""}
            onChange={(e) => handleFilterChange("level", e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">타입</Label>
          <Input
            id="type"
            placeholder="타입 입력"
            value={localFilter.type || ""}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label>등록 일시</Label>
          <DatePickerWithRange
            date={dateRange}
            onSelect={handleDateChange}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6">
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
          size="sm"
          disabled={isSubmitting}
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </Button>
        <Button onClick={handleSearch} size="sm" disabled={isSubmitting}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              검색 중...
            </>
          ) : (
            "조회"
          )}
        </Button>
      </div>
    </>
  );
}
