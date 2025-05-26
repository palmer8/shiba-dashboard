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
  startOfWeek,
  endOfWeek,
  differenceInMinutes,
  isWithinInterval,
} from "date-fns";
import { AttendanceList } from "./attendance-list";
import { AttendanceStats } from "./attendance-stats";
import { AttendanceCalendar } from "./attendance-calendar";
import { AttendanceRecordWithUser, SimplifiedUser } from "@/types/attendance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  // 근무자와 퇴사자 구분
  const activeUsers = initialUsers.filter(user => user.isPermissive);
  const inactiveUsers = initialUsers.filter(user => !user.isPermissive);

  // 이번주 통계 계산
  const calculateThisWeekStats = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 월요일 시작
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // 일요일 끝

    let totalWorkMinutes = 0;
    let workingUsersCount = 0;
    const userWorkTimes = new Map<number, number>();

    initialRecords.forEach((record) => {
      if (record.checkInTime && record.checkOutTime) {
        const checkIn = new Date(record.checkInTime);
        const checkOut = new Date(record.checkOutTime);
        
        // 이번주에 해당하는 근무 기록만 계산
        if (
          checkIn && 
          checkOut && 
          checkOut > checkIn &&
          isWithinInterval(checkIn, { start: weekStart, end: weekEnd })
        ) {
          const workMinutes = differenceInMinutes(checkOut, checkIn);
          totalWorkMinutes += workMinutes;
          
          // 사용자별 근무 시간 누적
          const currentUserTime = userWorkTimes.get(record.userNumericId) || 0;
          userWorkTimes.set(record.userNumericId, currentUserTime + workMinutes);
        }
      }
    });

    workingUsersCount = userWorkTimes.size;
    const averageWorkMinutes = workingUsersCount > 0 ? totalWorkMinutes / workingUsersCount : 0;

    return {
      totalWorkMinutes,
      workingUsersCount,
      averageWorkMinutes,
    };
  };

  const thisWeekStats = calculateThisWeekStats();

  // 분을 시간과 분 문자열로 변환하는 함수
  const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
    if (isNaN(totalMinutes) || totalMinutes <= 0) return "0시간";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ""}`.trim();
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
      {/* 이번주 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              이번주 총 근무 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatMinutesToHoursAndMinutes(thisWeekStats.totalWorkMinutes)}
            </div>
            <p className="text-xs text-muted-foreground">
              ({format(startOfWeek(new Date(), { weekStartsOn: 1 }), "M/d")} ~ {format(endOfWeek(new Date(), { weekStartsOn: 1 }), "M/d")})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              이번주 근무 인원
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {thisWeekStats.workingUsersCount}명
            </div>
            <p className="text-xs text-muted-foreground">
              전체 {activeUsers.length}명 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              평균 근무 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatMinutesToHoursAndMinutes(thisWeekStats.averageWorkMinutes)}
            </div>
            <p className="text-xs text-muted-foreground">
              1인당 평균
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            근무자 ({activeUsers.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            퇴사자 ({inactiveUsers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <AttendanceList
            records={initialRecords}
            users={activeUsers}
            expandedAdminId={expandedAdminId}
            onExpand={setExpandedAdminId}
            dateRange={date}
          />
        </TabsContent>
        
        <TabsContent value="inactive">
          <AttendanceList
            records={initialRecords}
            users={inactiveUsers}
            expandedAdminId={expandedAdminId}
            onExpand={setExpandedAdminId}
            dateRange={date}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
