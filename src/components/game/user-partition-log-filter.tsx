"use client";

import { Input } from "@/components/ui/input";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw, Loader2, Activity, Database, HardDrive } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { PartitionLogFilter } from "@/types/game";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { Session } from "next-auth";

interface PartitionLogFilterProps {
  filter: PartitionLogFilter;
  metadata?: {
    memoryLogs: number;
    databaseLogs: number;
    bufferSize: number;
  };
  session: Session;
}

export default function UserPartitionLogFilter({ 
  filter, 
  metadata,
  session
}: PartitionLogFilterProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<PartitionLogFilter>(filter);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filter.startDate && filter.endDate
      ? {
          from: new Date(filter.startDate),
          to: new Date(filter.endDate),
        }
      : undefined
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilterChange = useCallback(
    (
      key: keyof PartitionLogFilter,
      value: PartitionLogFilter[keyof PartitionLogFilter]
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
      router.replace("/log/user-partition");
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
    <div className="space-y-6">
      {/* 서버 상태 정보 카드 - MASTER 이상만 표시 */}
      {metadata && session.user && hasAccess(session.user.role, UserRole.MASTER) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              새로운 파티션 로그 서버 상태
            </CardTitle>
            <CardDescription>
              실시간 메모리 버퍼와 데이터베이스에서 로그를 조회합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">메모리 로그</p>
                <Badge variant="secondary" className="mt-1">
                  {metadata.memoryLogs.toLocaleString()}개
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">데이터베이스 로그</p>
                <Badge variant="default" className="mt-1">
                  {metadata.databaseLogs.toLocaleString()}개
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">현재 버퍼</p>
                <Badge 
                  variant={metadata.bufferSize > 500 ? "destructive" : "outline"}
                  className="mt-1"
                >
                  {metadata.bufferSize}개
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 필터 조건 */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">검색 조건</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="message">메시지</Label>
              <Input
                id="message"
                placeholder="메시지 입력 (부분 검색)"
                value={localFilter.message || ""}
                onChange={(e) => handleFilterChange("message", e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">로그 레벨</Label>
              <Select
                value={localFilter.level || "all"}
                onValueChange={(value) => handleFilterChange("level", value === "all" ? undefined : value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="레벨 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">로그 타입</Label>
              <Input
                id="type"
                placeholder="예: PLAYER, ITEM, SYSTEM"
                value={localFilter.type || ""}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>날짜 범위</Label>
              <DatePickerWithRange
                date={dateRange}
                onSelect={handleDateChange}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
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
        </CardContent>
      </Card>
    </div>
  );
} 