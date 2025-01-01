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
import { ProcessedAdminAttendance } from "@/types/attendance";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface AttendanceStatsProps {
  data: ProcessedAdminAttendance[];
  dateRange?: DateRange;
}

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

export function AttendanceStats({ data, dateRange }: AttendanceStatsProps) {
  // 근무 시간 데이터 계산 함수
  const calculateWorkHoursData = (
    records: ProcessedAdminAttendance["records"]
  ): ChartData[] => {
    return records
      .filter((record) => record.workHours !== "-")
      .map((record) => ({
        date: format(new Date(record.date), "MM/dd"),
        hours: parseFloat(record.workHours.replace("시간", "")),
        expected: 8,
      }));
  };

  // 시간대별 근무 인원 계산
  const calculateTimeDistribution = (
    attendances: ProcessedAdminAttendance[]
  ): TimeDistribution[] => {
    const timeSlots = new Map<string, number>();

    // 초기 시간대 설정 (0시부터 24시까지 2시간 단위)
    for (let i = 0; i < 24; i += 2) {
      const timeSlot = `${String(i).padStart(2, "0")}-${String(i + 2).padStart(
        2,
        "0"
      )}`;
      timeSlots.set(timeSlot, 0);
    }

    // 근무 시간대별 인원 계산
    attendances.forEach((admin) => {
      // 선택한 날짜 범위의 records만 필터링
      const filteredRecords = admin.records.filter((record) => {
        const recordDate = new Date(record.date);
        if (!dateRange?.from || !dateRange?.to) return true; // 날짜 범위가 없으면 모든 기록 포함
        return recordDate >= dateRange.from && recordDate <= dateRange.to;
      });

      filteredRecords.forEach((record) => {
        if (!record.displayIn || !record.displayOut) return;

        const startHour = parseInt(record.displayIn.split(":")[0]);
        let endHour = parseInt(record.displayOut.split(":")[0]);

        // 익일 퇴근인 경우 처리
        if (record.isOvernight) {
          endHour += 24;
        }

        // 각 시간대별 카운트 증가
        for (let hour = startHour; hour < endHour; hour++) {
          const normalizedHour = hour % 24;
          const slotStart = Math.floor(normalizedHour / 2) * 2;
          const timeSlot = `${String(slotStart).padStart(2, "0")}-${String(
            slotStart + 2
          ).padStart(2, "0")}`;

          if (timeSlots.has(timeSlot)) {
            // 해당 시간대의 평균 인원 계산을 위해 누적
            timeSlots.set(timeSlot, (timeSlots.get(timeSlot) || 0) + 1);
          }
        }
      });
    });

    // 전체 일수로 나누어 평균 인원 계산
    const totalDays =
      dateRange?.from && dateRange?.to
        ? Math.ceil(
            (dateRange.to.getTime() - dateRange.from.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        : 1;

    // Map을 배열로 변환하고 평균 계산
    return Array.from(timeSlots.entries()).map(([time, count]) => ({
      time,
      count: Math.ceil(count / totalDays), // 소수점 올림 처리
    }));
  };

  const workHoursData = calculateWorkHoursData(data[0]?.records || []);
  const timeDistribution = calculateTimeDistribution(data);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">근무 시간</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={workHoursData}>
                <defs>
                  <linearGradient id="workHours" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">
                              실제 근무
                            </span>
                            <span className="font-bold">
                              {payload[0].value}시간
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">
                              기대 근무
                            </span>
                            <span className="font-bold">
                              {payload[1].value}시간
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="hsl(var(--primary))"
                  fill="url(#workHours)"
                />
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            시간대별 근무 인원
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">
                              근무 인원
                            </span>
                            <span className="font-bold">
                              {payload[0].value}명
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
