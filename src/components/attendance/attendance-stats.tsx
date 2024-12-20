"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { ChartTooltipContent } from "../ui/chart";

interface AttendanceStatsProps {
  data?: any; // 실제 데이터 타입으로 변경 필요
}

export function AttendanceStats({ data }: AttendanceStatsProps) {
  // 임시 데이터
  const averageWorkHours = [
    { date: "12/09", hours: 8.5, expected: 8 },
    { date: "12/10", hours: 7.8, expected: 8 },
    { date: "12/11", hours: 8.2, expected: 8 },
    { date: "12/12", hours: 8.7, expected: 8 },
    { date: "12/13", hours: 8.1, expected: 8 },
  ];

  const timeDistribution = [
    { time: "07-09", count: 2 },
    { time: "09-11", count: 8 },
    { time: "11-13", count: 5 },
    { time: "13-15", count: 6 },
    { time: "15-17", count: 7 },
    { time: "17-19", count: 4 },
    { time: "19-21", count: 1 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">평균 근무 시간</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={averageWorkHours}>
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
