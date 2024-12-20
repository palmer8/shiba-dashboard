"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { AttendanceCalendar } from "./attendance-calendar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { Admin } from "@/types/attendance";

const MOCK_ADMINS: Admin[] = [
  {
    id: "1",
    name: "도꾸",
    role: "마스터",
    todayAttendance: {
      startTime: "09:00",
      endTime: null,
    },
    workHours: {
      "2024-12-10": [{ startTime: "09:00", endTime: "18:00" }],
      "2024-12-11": [{ startTime: "08:50", endTime: "18:10" }],
      "2024-12-12": [{ startTime: "09:10", endTime: "18:20" }],
      "2024-12-14": [{ startTime: "08:55", endTime: "18:05" }],
      "2024-12-15": [{ startTime: "09:05", endTime: null }],
      "2024-12-18": [{ startTime: "09:00", endTime: "19:00" }],
      "2024-12-19": [{ startTime: "09:15", endTime: "18:15" }],
      "2024-12-20": [{ startTime: "08:45", endTime: "18:00" }],
      "2024-12-21": [{ startTime: "09:00", endTime: "18:30" }],
    },
    weeklyStats: [
      { date: "12/10", hours: 9, expected: 8 },
      { date: "12/11", hours: 9.3, expected: 8 },
      { date: "12/12", hours: 9.2, expected: 8 },
      { date: "12/13", hours: 0, expected: 8 },
      { date: "12/14", hours: 9.1, expected: 8 },
      { date: "12/15", hours: 0, expected: 8 },
      { date: "12/18", hours: 10, expected: 8 },
      { date: "12/19", hours: 9, expected: 8 },
      { date: "12/20", hours: 9.25, expected: 8 },
      { date: "12/21", hours: 9.5, expected: 8 },
    ],
  },
  {
    id: "2",
    name: "토리",
    role: "인게임 관리자",
    todayAttendance: {
      startTime: "08:30",
      endTime: "17:30",
    },
    workHours: {
      "2024-12-10": [{ startTime: "08:30", endTime: "17:30" }],
      "2024-12-11": [{ startTime: "08:45", endTime: "17:45" }],
      "2024-12-13": [{ startTime: "08:15", endTime: "17:15" }],
      "2024-12-14": [{ startTime: "08:20", endTime: "19:20" }],
      "2024-12-15": [{ startTime: "08:40", endTime: "17:40" }],
      "2024-12-18": [{ startTime: "08:35", endTime: "17:35" }],
      "2024-12-19": [{ startTime: "08:25", endTime: "20:25" }],
      "2024-12-20": [{ startTime: "08:30", endTime: "17:30" }],
      "2024-12-21": [{ startTime: "08:40", endTime: "17:40" }],
    },
    weeklyStats: [
      { date: "12/10", hours: 9, expected: 8 },
      { date: "12/11", hours: 9, expected: 8 },
      { date: "12/12", hours: 0, expected: 8 },
      { date: "12/13", hours: 9, expected: 8 },
      { date: "12/14", hours: 11, expected: 8 },
      { date: "12/15", hours: 9, expected: 8 },
      { date: "12/18", hours: 9, expected: 8 },
      { date: "12/19", hours: 12, expected: 8 },
      { date: "12/20", hours: 9, expected: 8 },
      { date: "12/21", hours: 9, expected: 8 },
    ],
  },
  {
    id: "3",
    name: "담도",
    role: "스태프",
    todayAttendance: {
      startTime: "09:15",
      endTime: "18:15",
    },
    workHours: {
      "2024-12-10": [{ startTime: "09:15", endTime: "18:15" }],
      "2024-12-11": [{ startTime: "09:00", endTime: "18:00" }],
      "2024-12-12": [{ startTime: "09:30", endTime: "18:30" }],
      "2024-12-13": [{ startTime: "09:20", endTime: "20:20" }],
      "2024-12-14": [{ startTime: "09:10", endTime: "18:10" }],
      "2024-12-15": [{ startTime: "09:05", endTime: "18:05" }],
      "2024-12-18": [{ startTime: "09:00", endTime: "19:00" }],
      "2024-12-19": [{ startTime: "09:25", endTime: "18:25" }],
      "2024-12-20": [{ startTime: "09:15", endTime: "19:15" }],
      "2024-12-21": [{ startTime: "09:20", endTime: "18:20" }],
    },
    weeklyStats: [
      { date: "12/10", hours: 9, expected: 8 },
      { date: "12/11", hours: 9, expected: 8 },
      { date: "12/12", hours: 9, expected: 8 },
      { date: "12/13", hours: 11, expected: 8 },
      { date: "12/14", hours: 9, expected: 8 },
      { date: "12/15", hours: 9, expected: 8 },
      { date: "12/18", hours: 0, expected: 8 },
      { date: "12/19", hours: 9, expected: 8 },
      { date: "12/20", hours: 10, expected: 8 },
      { date: "12/21", hours: 9, expected: 8 },
    ],
  },
];

interface AttendanceListProps {
  expandedAdmin: string | null;
  onExpand: (id: string | null) => void;
  date: DateRange | undefined;
}

export function AttendanceList({
  expandedAdmin,
  onExpand,
  date,
}: AttendanceListProps) {
  // useState를 사용하여 상태 관리
  const [admins] = useState(MOCK_ADMINS);

  return (
    <div className="space-y-4">
      {admins.map((admin) => (
        <div key={admin.id} className="rounded-lg border bg-card">
          {/* 관리자 기본 정보 행 */}
          <div
            className={cn(
              "p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors",
              expandedAdmin === admin.id && "border-b"
            )}
            onClick={() =>
              onExpand(expandedAdmin === admin.id ? null : admin.id)
            }
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={admin.avatarUrl} />
                <AvatarFallback>{admin.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{admin.name}</span>
                  <Badge variant="outline">{admin.role}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {admin.todayAttendance?.startTime && (
                    <span>출근: {admin.todayAttendance.startTime}</span>
                  )}
                  {admin.todayAttendance?.endTime && (
                    <span> / 퇴근: {admin.todayAttendance.endTime}</span>
                  )}
                  {!admin.todayAttendance?.startTime && <span>미출근</span>}
                </div>
              </div>
            </div>
            {expandedAdmin === admin.id ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* 확장된 통계 및 캘린더 뷰 */}
          {expandedAdmin === admin.id && (
            <div className="p-4 space-y-6">
              {/* 캘린더 뷰 */}
              <AttendanceCalendar
                date={date}
                adminId={admin.id}
                data={admin.workHours}
              />

              {/* 통계 섹션 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">근무 통계</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* 주간 근무 시간 추이 */}
                  <Card className="p-4">
                    <div className="mb-2 text-sm text-muted-foreground">
                      주간 근무 시간 추이
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={admin.weeklyStats}>
                          <defs>
                            <linearGradient
                              id={`workHours-${admin.id}`}
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
                                        근무 시간
                                      </span>
                                      <span className="font-bold">
                                        {payload[0].value &&
                                        typeof payload[0].value === "number"
                                          ? payload[0].value?.toFixed(1)
                                          : 0}
                                        시간
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-muted-foreground">
                                        기준 시간
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
                            fill={`url(#workHours-${admin.id})`}
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
                  </Card>

                  {/* 평균 출퇴근 시간 */}
                  <Card className="p-4">
                    <div className="mb-2 text-sm text-muted-foreground">
                      평균 출퇴근 시간
                    </div>
                    <div className="h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-2">
                          {format(new Date(0, 0, 0, 9, 0), "HH:mm")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          평균 출근
                        </div>
                        <div className="h-px bg-border my-4" />
                        <div className="text-2xl font-bold mb-2">
                          {format(new Date(0, 0, 0, 18, 0), "HH:mm")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          평균 퇴근
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
