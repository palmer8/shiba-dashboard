"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { AttendanceFilter } from "./attendance-filter";
import { useRouter, useSearchParams } from "next/navigation";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { AttendanceList } from "./attendance-list";
import { AttendanceStats } from "./attendance-stats";
import { AttendanceCalendar } from "./attendance-calendar";
import { AttendanceRecordWithUser, SimplifiedUser } from "@/types/attendance";

interface AttendanceViewerProps {
  initialRecords: AttendanceRecordWithUser[];
  initialUsers: SimplifiedUser[];
}

export function AttendanceViewer({
  initialRecords,
  initialUsers,
}: AttendanceViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const deriveInitialDateRange = (): DateRange | undefined => {
    const today = new Date();
    return { from: startOfMonth(today), to: endOfMonth(today) };
  };

  const [date, setDate] = useState<DateRange | undefined>(
    deriveInitialDateRange()
  );
  const [expandedAdminId, setExpandedAdminId] = useState<string | null>(null);

  const handleDateChange = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", format(range.from, "yyyy-MM-dd"));
    params.set("endDate", format(range.to, "yyyy-MM-dd"));

    router.push(`/admin/attendance?${params.toString()}`);
    setDate(range);
  };

  if (!initialRecords || initialRecords.length === 0) {
    return (
      <div className="space-y-6">
        <AttendanceFilter date={date} onDateChange={handleDateChange} />
        <div className="text-center py-10 text-muted-foreground">
          선택된 기간에 출퇴근 기록이 없습니다. (또는 전체 기록이 없습니다.)
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AttendanceList
        records={initialRecords}
        users={initialUsers}
        expandedAdminId={expandedAdminId}
        onExpand={setExpandedAdminId}
        dateRange={date}
      />
    </div>
  );
}
