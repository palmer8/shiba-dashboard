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
import { AdminAttendance } from "@/types/attendance";
import { format } from "date-fns";

interface AttendanceStatsProps {
  data: AdminAttendance[];
}

export function AttendanceStats({ data }: AttendanceStatsProps) {
  // 근무 시간 계산 함수
  const calculateWorkHours = (records: any[]) => {
    return records.map((record) => {
      const start = new Date(record.in);
      const end = record.out ? new Date(record.out) : null;

      if (!end)
        return {
          date: format(start, "MM/dd"),
          hours: 0,
          expected: 8,
        };

      let hours;
      if (end < start) {
        // 날짜를 넘어가는 경우 (예: 17:00 - 02:00)
        const nextDay = new Date(end);
        nextDay.setDate(nextDay.getDate() + 1);
        hours = (nextDay.getTime() - start.getTime()) / (1000 * 60 * 60);
      } else {
        hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }

      return {
        date: format(start, "MM/dd"),
        hours: Math.round(hours * 10) / 10, // 소수점 첫째자리까지
        expected: 8,
      };
    });
  };

  // 시간대별 근무 인원 계산 개선
  const calculateTimeDistribution = (attendances: AdminAttendance[]) => {
    const timeSlots = new Map<string, number>();
    for (let i = 0; i < 24; i += 2) {
      const timeSlot = `${String(i).padStart(2, "0")}-${String(i + 2).padStart(
        2,
        "0"
      )}`;
      timeSlots.set(timeSlot, 0);
    }

    attendances.forEach((admin) => {
      Object.values(admin.workHours).forEach((works) => {
        works.forEach((work) => {
          const startHour = parseInt(work.startTime.split(":")[0]);
          const endHour = work.endTime
            ? parseInt(work.endTime.split(":")[0])
            : (startHour + 1) % 24;

          for (let hour = startHour; hour !== endHour; hour = (hour + 1) % 24) {
            const slot = `${String(Math.floor(hour / 2) * 2).padStart(
              2,
              "0"
            )}-${String(Math.floor(hour / 2) * 2 + 2).padStart(2, "0")}`;
            timeSlots.set(slot, (timeSlots.get(slot) || 0) + 1);
          }
        });
      });
    });

    return Array.from(timeSlots).map(([time, count]) => ({ time, count }));
  };

  const workHoursData = calculateWorkHours(data[0]?.records || []);
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
                    if (!active || !payload) return null;
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
                    if (!active || !payload) return null;
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
