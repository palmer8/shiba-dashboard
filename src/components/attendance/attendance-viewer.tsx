"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { AttendanceFilter } from "./attendance-filter";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { AttendanceList } from "./attendance-list";
import { AttendanceStats } from "./attendance-stats";
import { AdminAttendance } from "@/types/attendance";

interface AttendanceViewerProps {
  attendances?: AdminAttendance[];
}

export function AttendanceViewer({ attendances = [] }: AttendanceViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);

  const [date, setDate] = useState<DateRange | undefined>({
    from: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : initialDate,
    to: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : initialDate,
  });
  const [expandedAdmin, setExpandedAdmin] = useState<string | null>(null);

  const handleDateChange = (range: DateRange | undefined) => {
    if (!range) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", format(range.from!, "yyyy-MM-dd"));
    if (range.to) {
      params.set("endDate", format(range.to, "yyyy-MM-dd"));
    }
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
      <AttendanceStats data={attendances} />
      <AttendanceList
        attendances={attendances}
        expandedAdmin={expandedAdmin}
        onExpand={setExpandedAdmin}
        date={date}
      />
    </div>
  );
}
