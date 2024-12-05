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
import { CreditFilter } from "@/types/filters/credit-filter";
import { ActionType, RewardRevokeCreditType } from "@prisma/client";

interface CreditSearchFilterProps {
  filters: Omit<CreditFilter, "status">;
}

export function CreditSearchFilter({ filters }: CreditSearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localFilter, setLocalFilter] =
    useState<Omit<CreditFilter, "status">>(filters);

  // 등록일 날짜 범위
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );

  // 승인일 날짜 범위
  const [approveDateRange, setApproveDateRange] = useState<
    DateRange | undefined
  >(
    filters.approveStartDate && filters.approveEndDate
      ? {
          from: new Date(filters.approveStartDate),
          to: new Date(filters.approveEndDate),
        }
      : undefined
  );

  const handleFilterChange = useCallback(
    (key: keyof Omit<CreditFilter, "status">, value: any) => {
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

    // 현재 status 값 유지
    const currentStatus = searchParams.get("status");
    if (currentStatus) params.set("status", currentStatus);

    // 등록일 날짜 범위
    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString());
    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString());

    // 승인일 날짜 범위
    if (approveDateRange?.from)
      params.set("approveStartDate", approveDateRange.from.toISOString());
    if (approveDateRange?.to)
      params.set("approveEndDate", approveDateRange.to.toISOString());

    if (localFilter.userId) params.set("userId", localFilter.userId.toString());
    if (localFilter.type) params.set("type", localFilter.type);
    if (localFilter.creditType)
      params.set("creditType", localFilter.creditType);

    router.push(`?${params.toString()}`);
  }, [localFilter, dateRange, approveDateRange, router, searchParams]);

  const handleReset = useCallback(() => {
    const params = new URLSearchParams();
    // status만 유지하고 나머지 초기화
    const currentStatus = searchParams.get("status");
    if (currentStatus) params.set("status", currentStatus);

    router.push(`?${params.toString()}`);
    setLocalFilter({});
    setDateRange(undefined);
    setApproveDateRange(undefined);
  }, [router, searchParams]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>등록일</Label>
          <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
        </div>

        <div className="space-y-2">
          <Label>승인일</Label>
          <DatePickerWithRange
            date={approveDateRange}
            onSelect={setApproveDateRange}
          />
        </div>

        <div className="space-y-2">
          <Label>고유번호</Label>
          <Input
            placeholder="고유번호 입력"
            value={localFilter.userId || ""}
            onChange={(e) =>
              handleFilterChange("userId", Number(e.target.value))
            }
            type="number"
          />
        </div>

        <div className="space-y-2">
          <Label>타입</Label>
          <Select
            value={localFilter.type || "ALL"}
            onValueChange={(value) =>
              value === "ALL"
                ? handleFilterChange("type", undefined)
                : handleFilterChange("type", value as ActionType)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ADD">지급</SelectItem>
              <SelectItem value="REMOVE">회수</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>재화 종류</Label>
          <Select
            value={localFilter.creditType}
            onValueChange={(value) =>
              value === "ALL"
                ? handleFilterChange("creditType", undefined)
                : handleFilterChange(
                    "creditType",
                    value as RewardRevokeCreditType
                  )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="MONEY">현금</SelectItem>
              <SelectItem value="BANK">계좌</SelectItem>
              <SelectItem value="CREDIT">무료 캐시</SelectItem>
              <SelectItem value="CREDIT2">유료 캐시</SelectItem>
              <SelectItem value="CURRENT_COIN">마일리지</SelectItem>
            </SelectContent>
          </Select>
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
