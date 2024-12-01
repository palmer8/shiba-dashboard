"use client";

import { WhitelistFilters } from "@/types/report";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";

interface WhitelistFilterProps {
  filter: WhitelistFilters;
}

export default function WhitelistFilter({ filter }: WhitelistFilterProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<WhitelistFilters>(filter);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filter.date ? { from: filter.date[0], to: filter.date[1] } : undefined
  );

  const handleFilterChange = useCallback(
    (
      key: keyof WhitelistFilters,
      value: WhitelistFilters[keyof WhitelistFilters]
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

    if (localFilter.user_ip) {
      searchParams.set("user_ip", localFilter.user_ip);
    }
    if (localFilter.comment) {
      searchParams.set("comment", localFilter.comment);
    }
    if (localFilter.registrant) {
      searchParams.set("registrant", localFilter.registrant);
    }
    if (dateRange?.from && dateRange?.to) {
      searchParams.set("fromDate", dateRange.from.toISOString());
      searchParams.set("toDate", dateRange.to.toISOString());
    }

    router.replace(`?${searchParams.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.replace("/block/ip");
    setLocalFilter({ page: 1 });
    setDateRange(undefined);
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="user_ip">IP 주소</Label>
          <Input
            id="user_ip"
            placeholder="IP 주소 입력"
            value={localFilter.user_ip || ""}
            onChange={(e) => handleFilterChange("user_ip", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">설명</Label>
          <Input
            id="comment"
            placeholder="설명 입력"
            value={localFilter.comment || ""}
            onChange={(e) => handleFilterChange("comment", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrant">등록자</Label>
          <Input
            id="registrant"
            placeholder="등록자 입력"
            value={localFilter.registrant || ""}
            onChange={(e) => handleFilterChange("registrant", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>등록 일시</Label>
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
