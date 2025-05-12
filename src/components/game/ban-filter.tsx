"use client";

import { BanFilters } from "@/service/ban-service";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";

interface BanFilterProps {
  filter: BanFilters;
}

export default function BanFilter({ filter }: BanFilterProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<BanFilters>(filter);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filter.fromDate && filter.toDate
      ? { from: new Date(filter.fromDate), to: new Date(filter.toDate) }
      : undefined
  );

  const handleFilterChange = useCallback(
    (key: keyof BanFilters, value: BanFilters[keyof BanFilters]) => {
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

    if (localFilter.user_id) {
      searchParams.set("user_id", localFilter.user_id);
    }
    if (localFilter.name) {
      searchParams.set("name", localFilter.name);
    }
    if (localFilter.banreason) {
      searchParams.set("banreason", localFilter.banreason);
    }
    if (localFilter.identifiers) {
      searchParams.set("identifiers", localFilter.identifiers);
    }
    if (dateRange?.from && dateRange?.to) {
      searchParams.set("fromDate", dateRange.from.toISOString());
      searchParams.set("toDate", dateRange.to.toISOString());
    }

    router.replace(`?${searchParams.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.replace("/game/ban");
    setLocalFilter({ page: 1 });
    setDateRange(undefined);
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label htmlFor="user_id">고유번호</Label>
          <Input
            id="user_id"
            placeholder="고유번호 입력"
            value={localFilter.user_id || ""}
            onChange={(e) => handleFilterChange("user_id", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">닉네임</Label>
          <Input
            id="name"
            placeholder="닉네임 입력"
            value={localFilter.name || ""}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="banreason">밴 사유</Label>
          <Input
            id="banreason"
            placeholder="밴 사유 입력"
            value={localFilter.banreason || ""}
            onChange={(e) => handleFilterChange("banreason", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="identifiers">식별자</Label>
          <Input
            id="identifiers"
            placeholder="식별자(license, ip 등) 입력"
            value={localFilter.identifiers || ""}
            onChange={(e) => handleFilterChange("identifiers", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>생성 일자</Label>
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
