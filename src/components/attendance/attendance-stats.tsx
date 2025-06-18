"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import {
  getMinutes,
  getHours,
  differenceInMinutes,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  isWithinInterval,
  max,
  min,
  isValid,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  isThisWeek,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  AttendanceStatsProps,
  AttendanceRecordWithUser,
  WorkTrendData,
} from "@/types/attendance";
import { useMemo } from "react";

// 분을 시간과 분 문자열로 변환하는 함수 (AttendanceList.tsx에서 가져오거나 여기에 정의)
const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
  if (isNaN(totalMinutes) || totalMinutes <= 0) return "0시간";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ""}`.trim();
};

// 차트 데이터 타입 정의
interface ChartData {
  date: string;
  hours: number;
  expected: number;
}

interface TimeDistribution {
  time: string;
  count: number;
}

interface TooltipPayload {
  value: number;
  dataKey: string;
}

// 평균 시간 계산 함수 (HH:mm 형식)
const calculateAverageTime = (times: Date[]): string => {
  if (!times || times.length === 0) return "--:--";
  const validTimes = times.filter((t) => isValid(t)); // 유효한 Date 객체만 필터링
  if (validTimes.length === 0) return "--:--";

  const totalMinutes = validTimes.reduce((acc, date) => {
    return acc + getHours(date) * 60 + getMinutes(date);
  }, 0);
  const averageMinutes = Math.round(totalMinutes / validTimes.length);
  const hours = Math.floor(averageMinutes / 60);
  const minutes = averageMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

const CustomTooltipWorkTrend = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          근무 시간:{" "}
          <span className="font-semibold">
            {payload[0].value?.toFixed(2) ?? 0}시간
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function AttendanceStats({
  records,
  dateRange,
  targetUserNumericId,
  isView = true
}: AttendanceStatsProps) {
  const filteredRecords = useMemo(() => {
    if (!records) return [];
    let userSpecificRecords = records;
    if (targetUserNumericId) {
      userSpecificRecords = records.filter(
        (r) => r.userNumericId === targetUserNumericId
      );
    }
    if (dateRange && dateRange.from && dateRange.to) {
      const from = startOfDay(dateRange.from);
      const to = endOfDay(dateRange.to);
      userSpecificRecords = userSpecificRecords.filter(
        (record) =>
          isWithinInterval(new Date(record.checkInTime), {
            start: from,
            end: to,
          }) ||
          (record.checkOutTime &&
            isWithinInterval(new Date(record.checkOutTime), {
              start: from,
              end: to,
            }))
      );
    }
    return userSpecificRecords;
  }, [records, dateRange, targetUserNumericId]);

  const monthlyTotalWorkTime = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) return 0;

    let totalMinutes = 0;
    filteredRecords.forEach((record) => {
      if (record.checkInTime && record.checkOutTime) {
        const checkIn = new Date(record.checkInTime);
        const checkOut = new Date(record.checkOutTime);
        if (isValid(checkIn) && isValid(checkOut) && checkOut > checkIn) {
          totalMinutes += differenceInMinutes(checkOut, checkIn);
        }
      }
    });
    return totalMinutes;
  }, [filteredRecords]);

  // 이번주 근무 시간 계산
  const weeklyTotalWorkTime = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) return 0;

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 월요일 시작
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // 일요일 끝

    let totalMinutes = 0;
    filteredRecords.forEach((record) => {
      if (record.checkInTime && record.checkOutTime) {
        const checkIn = new Date(record.checkInTime);
        const checkOut = new Date(record.checkOutTime);
        
        // 이번주에 해당하는 근무 기록만 계산
        if (
          isValid(checkIn) && 
          isValid(checkOut) && 
          checkOut > checkIn &&
          isWithinInterval(checkIn, { start: weekStart, end: weekEnd })
        ) {
          totalMinutes += differenceInMinutes(checkOut, checkIn);
        }
      }
    });
    return totalMinutes;
  }, [filteredRecords]);

  const averageCheckIn = useMemo(() => {
    const checkInTimes = filteredRecords
      .map((r) => new Date(r.checkInTime))
      .filter(Boolean);
    return calculateAverageTime(checkInTimes);
  }, [filteredRecords]);

  const averageCheckOut = useMemo(() => {
    const checkOutTimes = filteredRecords
      .filter((r) => r.checkOutTime)
      .map((r) => new Date(r.checkOutTime!))
      .filter(Boolean);
    return calculateAverageTime(checkOutTimes);
  }, [filteredRecords]);

  const workTrendData: WorkTrendData[] = useMemo(() => {
    if (
      !dateRange ||
      !dateRange.from ||
      !dateRange.to ||
      filteredRecords.length === 0
    )
      return [];

    const trend: WorkTrendData[] = [];
    const daysInInterval = eachDayOfInterval({
      start: startOfDay(dateRange.from),
      end: startOfDay(dateRange.to),
    });

    daysInInterval.forEach((day) => {
      let totalWorkMinutesToday = 0;
      filteredRecords.forEach((record) => {
        const checkIn = new Date(record.checkInTime);
        const checkOut = record.checkOutTime
          ? new Date(record.checkOutTime)
          : null;

        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        const overlaps =
          checkIn < dayEnd &&
          (checkOut ? checkOut > dayStart : checkIn >= dayStart); // 당일 근무 중인 것도 포함

        if (overlaps) {
          const segmentStart = max([checkIn, dayStart]);
          // 근무 중인 경우, 해당 날짜의 끝 또는 현재 시간 중 더 이른 시간까지로 계산 (선택적)
          // 여기서는 간결하게 해당 날짜의 끝까지만 고려
          const segmentEnd = checkOut
            ? min([checkOut, dayEnd])
            : isWithinInterval(new Date(), { start: dayStart, end: dayEnd })
            ? min([new Date(), dayEnd])
            : dayEnd;

          if (
            segmentStart < segmentEnd &&
            isValid(segmentStart) &&
            isValid(segmentEnd)
          ) {
            totalWorkMinutesToday += differenceInMinutes(
              segmentEnd,
              segmentStart
            );
          }
        }
      });
      trend.push({
        date: format(day, "MM/dd"),
        workHours:
          totalWorkMinutesToday > 0
            ? parseFloat((totalWorkMinutesToday / 60).toFixed(2))
            : 0,
      });
    });
    return trend;
  }, [filteredRecords, dateRange]);

  if (filteredRecords.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        선택된 조건에 해당하는 근무 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            평균 출퇴근 시간
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {averageCheckIn}
              </div>
              <p className="text-xs text-muted-foreground">평균 출근</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {averageCheckOut}
              </div>
              <p className="text-xs text-muted-foreground">평균 퇴근</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            이번주 근무 시간
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatMinutesToHoursAndMinutes(weeklyTotalWorkTime)}
              </div>
              <p className="text-xs text-muted-foreground">
                ({format(startOfWeek(new Date(), { weekStartsOn: 1 }), "M/d")} ~ {format(endOfWeek(new Date(), { weekStartsOn: 1 }), "M/d")})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            월 총 근무 시간
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatMinutesToHoursAndMinutes(monthlyTotalWorkTime)}
              </div>
              {dateRange?.from && (
                <p className="text-xs text-muted-foreground">
                  ({format(dateRange.from, "yyyy년 M월")})
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {
        isView && (
          <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {dateRange &&
              dateRange.from &&
              dateRange.to &&
              format(dateRange.from, "yyyy-MM-dd") ===
                format(startOfDay(new Date()), "yyyy-MM-dd") &&
              format(dateRange.to, "yyyy-MM-dd") ===
                format(endOfDay(new Date()), "yyyy-MM-dd")
                ? "오늘 근무 현황"
                : dateRange &&
                  dateRange.from &&
                  dateRange.to &&
                  differenceInDays(dateRange.to, dateRange.from) <= 7
                ? "주간 근무 추이 (시간)"
                : "근무 시간 분포 (일별, 시간)"}
              {/* 일일/주간/월간에 따라 제목 변경 가능 */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={workTrendData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: -20, // Y축 레이블 공간 확보
                    bottom: 5,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="workHoursGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/50"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    content={<CustomTooltipWorkTrend />}
                    cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="workHours"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#workHoursGradient)"
                    strokeWidth={2}
                    dot={false}
                    // activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        )
      }
      </div>
  );
}
