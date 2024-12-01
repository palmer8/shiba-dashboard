"use client";

import { ReportFilters } from "@/types/report";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IncidentReportFilterProps {
  filter: ReportFilters;
}

export default function IncidentReportFilter({
  filter,
}: IncidentReportFilterProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<ReportFilters>(filter);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filter.incident_time
      ? { from: filter.incident_time[0], to: filter.incident_time[1] }
      : undefined
  );

  const handleFilterChange = useCallback(
    (key: keyof ReportFilters, value: ReportFilters[keyof ReportFilters]) => {
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

    if (localFilter.penalty_type) {
      searchParams.set("penalty_type", localFilter.penalty_type);
    }
    if (localFilter.reason) {
      searchParams.set("reason", localFilter.reason);
    }
    if (localFilter.target_user_id) {
      searchParams.set("target_user_id", localFilter.target_user_id);
    }
    if (localFilter.reporting_user_id) {
      searchParams.set("reporting_user_id", localFilter.reporting_user_id);
    }
    if (localFilter.admin) {
      searchParams.set("admin", localFilter.admin);
    }
    if (dateRange?.from && dateRange?.to) {
      searchParams.set("fromDate", dateRange.from.toISOString());
      searchParams.set("toDate", dateRange.to.toISOString());
    }

    router.replace(`?${searchParams.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.replace("/block/report");
    setLocalFilter({ page: 1 });
    setDateRange(undefined);
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="penalty_type">처벌 유형</Label>
          <Select
            value={localFilter.penalty_type}
            onValueChange={(value) => handleFilterChange("penalty_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="처벌 유형 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="경고">경고</SelectItem>
              <SelectItem value="정지해제">정지해제</SelectItem>
              <SelectItem value="게임정지">게임정지</SelectItem>
              <SelectItem value="구두경고">구두경고</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">사유</Label>
          <Input
            id="reason"
            placeholder="사유 입력"
            value={localFilter.reason || ""}
            onChange={(e) => handleFilterChange("reason", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_user_id">대상 유저 ID</Label>
          <Input
            id="target_user_id"
            placeholder="대상 유저 ID 입력"
            value={localFilter.target_user_id || ""}
            onChange={(e) =>
              handleFilterChange("target_user_id", e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporting_user_id">신고자 ID</Label>
          <Input
            id="reporting_user_id"
            placeholder="신고자 ID 입력"
            value={localFilter.reporting_user_id || ""}
            onChange={(e) =>
              handleFilterChange("reporting_user_id", e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin">처리자</Label>
          <Input
            id="admin"
            placeholder="처리자 입력"
            value={localFilter.admin || ""}
            onChange={(e) => handleFilterChange("admin", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>처리 일시</Label>
          <DatePickerWithRange date={dateRange} onSelect={handleDateChange} />
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
