"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { AttendanceFilter } from "./attendance-filter";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { AttendanceList } from "./attendance-list";
import { AttendanceStats } from "./attendance-stats";
import { ProcessedAdminAttendance } from "@/types/attendance";

interface AttendanceViewerProps {
  attendances?: ProcessedAdminAttendance[];
}

export function AttendanceViewer({ attendances = [] }: AttendanceViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 초기 날짜 범위 설정 (한달)
  const today = new Date();
  const oneMonthAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    today.getDate()
  );

  const [date, setDate] = useState<DateRange | undefined>({
    from: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : oneMonthAgo,
    to: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : today,
  });
  const [expandedAdmin, setExpandedAdmin] = useState<number | null>(null);

  const handleDateChange = (range: DateRange | undefined) => {
    if (!range?.from) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", format(range.from, "yyyy-MM-dd"));
    params.set("endDate", format(range.to || range.from, "yyyy-MM-dd"));

    router.push(`/admin/attendance?${params.toString()}`);
    setDate(range);
  };

  if (!attendances.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        출퇴근 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AttendanceFilter date={date} onDateChange={handleDateChange} />
      <AttendanceStats data={attendances} dateRange={date} />
      <AttendanceList
        attendances={attendances}
        expandedAdmin={expandedAdmin}
        onExpand={setExpandedAdmin}
        date={date}
      />
    </div>
  );
}
