"use client";

import { PaymentFilter } from "@/types/filters/payment-filter";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, RotateCcw } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";

interface PaymentSearchFilterProps {
  filter: PaymentFilter;
}

export default function PaymentSearchFilter({
  filter,
}: PaymentSearchFilterProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<PaymentFilter>(filter);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filter.date ? { from: filter.date[0], to: filter.date[1] } : undefined
  );

  const handleFilterChange = useCallback(
    (key: keyof PaymentFilter, value: PaymentFilter[keyof PaymentFilter]) => {
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

    if (localFilter.ip) {
      searchParams.set("ip", localFilter.ip);
    }
    if (localFilter.email) {
      searchParams.set("email", localFilter.email);
    }
    if (localFilter.price) {
      searchParams.set("price", localFilter.price.toString());
    }
    if (dateRange?.from && dateRange?.to) {
      searchParams.set("fromDate", dateRange.from.toISOString());
      searchParams.set("toDate", dateRange.to.toISOString());
    }

    router.replace(`?${searchParams.toString()}`);
  }, [localFilter, dateRange, router]);

  const handleReset = useCallback(() => {
    router.replace("/payment");
    setLocalFilter({});
    setDateRange(undefined);
  }, [router]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="ip">IP 주소</Label>
          <Input
            id="ip"
            placeholder="IP 주소 입력"
            value={localFilter.ip || ""}
            onChange={(e) => handleFilterChange("ip", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            placeholder="이메일 입력"
            value={localFilter.email || ""}
            onChange={(e) => handleFilterChange("email", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>결제 기간</Label>
          <DatePickerWithRange date={dateRange} onSelect={handleDateChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">결제 금액</Label>
          <Input
            id="price"
            placeholder="결제 금액 입력"
            value={localFilter.price || ""}
            onChange={(e) =>
              handleFilterChange(
                "price",
                e.target.value ? e.target.value : undefined
              )
            }
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
