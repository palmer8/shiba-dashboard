"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { AttendanceCalendar } from "./attendance-calendar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ProcessedAdminAttendance, ProcessedRecord } from "@/types/attendance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AttendanceListProps {
  attendances: ProcessedAdminAttendance[];
  expandedAdmin: number | null;
  onExpand: (id: number | null) => void;
  date: DateRange | undefined;
}

export function AttendanceList({
  attendances,
  expandedAdmin,
  onExpand,
  date,
}: AttendanceListProps) {
  return (
    <div className="space-y-4">
      {attendances.map((admin) => (
        <div key={admin.userId} className="rounded-lg border bg-card">
          <div
            className={cn(
              "p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors",
              expandedAdmin === admin.userId && "border-b"
            )}
            onClick={() =>
              onExpand(expandedAdmin === admin.userId ? null : admin.userId)
            }
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{admin.nickname[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{admin.nickname}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {admin.today.in ? (
                    <>
                      <span>
                        출근: {format(new Date(admin.today.in), "HH:mm")}
                      </span>
                      {admin.today.out && (
                        <span>
                          {" "}
                          / 퇴근: {format(new Date(admin.today.out), "HH:mm")}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>미출근</span>
                  )}
                </div>
              </div>
            </div>
            {expandedAdmin === admin.userId ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {expandedAdmin === admin.userId && (
            <div className="p-4 space-y-6">
              <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="calendar">캘린더</TabsTrigger>
                  <TabsTrigger value="table">목록</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="mt-0">
                  <div className="grid gap-4 mb-6 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          평균 출퇴근 시간
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-2xl font-bold">
                              {admin.stats.averageTimes.in}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              평균 출근
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {admin.stats.averageTimes.out}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              평균 퇴근
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          주간 근무 추이
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[80px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={admin.stats.weeklyStats.filter(
                                (stat) => stat.hours <= 24
                              )}
                            >
                              <defs>
                                <linearGradient
                                  id="workHours"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
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
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                              />
                              <YAxis
                                domain={[0, 12]}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                              />
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null;
                                  return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                      <div className="grid gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-muted-foreground">
                                            근무시간
                                          </span>
                                          <span className="font-bold">
                                            {payload[0].value}시간
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
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <AttendanceCalendar
                    date={date}
                    adminId={admin.userId}
                    data={admin.workHours}
                  />
                </TabsContent>

                <TabsContent value="table" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>날짜</TableHead>
                        <TableHead>출근</TableHead>
                        <TableHead>퇴근</TableHead>
                        <TableHead className="text-right">근무시간</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admin.records
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        )
                        .map((record) => (
                          <TableRow key={record.date}>
                            <TableCell className="font-medium">
                              {record.date}
                            </TableCell>
                            <TableCell>{record.displayIn || "-"}</TableCell>
                            <TableCell>
                              {record.displayOut ? (
                                <>
                                  {record.displayOut}
                                  {record.isOvernight && (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      (익일)
                                    </span>
                                  )}
                                </>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {record.workHours}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 평균 시간 계산 헬퍼 함수
function calculateAverageTime(times: (string | null)[]): string {
  const validTimes = times.filter(Boolean) as string[];
  if (validTimes.length === 0) return "--:--";

  const totalMinutes = validTimes.reduce((acc, time) => {
    const date = new Date(time);
    return acc + date.getHours() * 60 + date.getMinutes();
  }, 0);

  const averageMinutes = Math.round(totalMinutes / validTimes.length);
  const hours = Math.floor(averageMinutes / 60);
  const minutes = averageMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}
// 근무 시간 계산 헬퍼 함수 추가
function calculateWorkHours(
  inTime: string | null,
  outTime: string | null
): string {
  if (!inTime || !outTime) return "-";

  const start = new Date(`2000/01/01 ${inTime}`);
  const end = new Date(`2000/01/01 ${outTime}`);

  // 익일 퇴근 처리
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return `${diff.toFixed(1)}시간`;
}
