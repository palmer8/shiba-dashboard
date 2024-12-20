"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { AttendanceCalendar } from "./attendance-calendar";
import { AttendanceFilter } from "./attendance-filter";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { AttendanceList } from "./attendance-list";
import { AttendanceStats } from "./attendance-stats";

interface AttendanceViewerProps {
  // 나중에 실제 데이터 타입으로 변경
  data?: any;
}

export function AttendanceViewer({ data }: AttendanceViewerProps) {
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

  return (
    <div className="space-y-6">
      <AttendanceFilter date={date} onDateChange={handleDateChange} />
      <AttendanceStats data={data} />
      <AttendanceList
        expandedAdmin={expandedAdmin}
        onExpand={setExpandedAdmin}
        date={date}
      />
    </div>
  );
}
