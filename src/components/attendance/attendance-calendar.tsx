"use client";

import { cn } from "@/lib/utils";
import {
  //   addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  //   startOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AttendanceCalendarProps, WorkHours } from "@/types/attendance";

// 시간을 위치값으로 변환하는 헬퍼 함수
function getTimePosition(time: string | null): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return (hours + minutes / 60) * 2.5;
}

// 근무 상태에 따른 스타일 반환 함수
function getWorkStatusStyle(startTime: string | null, endTime: string | null) {
  if (!startTime) return {};

  if (!endTime) {
    // 출근만 한 경우 (근무 중)
    return {
      backgroundColor: "hsl(var(--warning) / 0.15)",
      borderLeft: "3px solid hsl(var(--warning))",
      borderTop: "1px solid hsl(var(--warning) / 0.3)",
      borderBottom: "1px solid hsl(var(--warning) / 0.3)",
      borderRight: "1px solid hsl(var(--warning) / 0.3)",
    };
  }

  // 정상 출퇴근
  return {
    backgroundColor: "hsl(var(--primary) / 0.15)",
    borderLeft: "3px solid hsl(var(--primary))",
    borderTop: "1px solid hsl(var(--primary) / 0.3)",
    borderBottom: "1px solid hsl(var(--primary) / 0.3)",
    borderRight: "1px solid hsl(var(--primary) / 0.3)",
  };
}

// 근무 시간 텍스트 반환 함수
function getWorkTimeText(startTime: string | null, endTime: string | null) {
  if (!startTime) return "결근";
  if (!endTime) return `${startTime} - 근무중 ⌛`;
  return `${startTime} - ${endTime}`;
}

export function AttendanceCalendar({
  date,
  adminId,
  data,
}: AttendanceCalendarProps) {
  if (!date?.from || !date?.to) return null;

  const days = eachDayOfInterval({
    start: date.from,
    end: date.to,
  });

  // 주 단위로 날짜 분할
  const weeks = days.reduce<Date[][]>((acc, day) => {
    const weekIndex = Math.floor(days.indexOf(day) / 7);
    acc[weekIndex] = acc[weekIndex] || [];
    acc[weekIndex].push(day);
    return acc;
  }, []);

  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const today = new Date();

  return (
    <div className="rounded-lg bg-card">
      {/* 주간 네비게이션 */}
      <div className="flex items-center justify-between p-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeekIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentWeekIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(weeks[currentWeekIndex][0], "yyyy.MM.dd", { locale: ko })} -{" "}
          {format(
            weeks[currentWeekIndex][weeks[currentWeekIndex].length - 1],
            "yyyy.MM.dd",
            { locale: ko }
          )}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCurrentWeekIndex((prev) => Math.min(weeks.length - 1, prev + 1))
          }
          disabled={currentWeekIndex === weeks.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-[auto_1fr] divide-x">
        {/* 시간 눈금 */}
        <div className="w-16 py-4">
          <div className="grid auto-rows-[2.5rem] text-sm">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="px-2 py-1 text-muted-foreground">
                {String(i).padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        {/* 현재 주의 타임라인 */}
        <div className="relative w-full overflow-x-auto">
          <div className="sticky top-0 z-20 bg-card border-b">
            <div className="grid grid-cols-7">
              {weeks[currentWeekIndex].map((day) => (
                <div
                  key={day.toString()}
                  className={cn(
                    "px-2 py-1 text-center text-sm border-r last:border-r-0",
                    isSameDay(day, today) && "bg-accent"
                  )}
                >
                  {format(day, "M.d (eee)", { locale: ko })}
                </div>
              ))}
            </div>
          </div>

          {/* 타임라인 그리드 */}
          <div className="grid grid-cols-7 divide-x">
            {weeks[currentWeekIndex].map((day) => {
              const formattedDate = format(day, "yyyy-MM-dd");
              const workData = data?.[formattedDate];
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "relative min-h-[calc(24*2.5rem)]",
                    isToday && "bg-accent/10"
                  )}
                >
                  <div className="absolute inset-0 grid auto-rows-[2.5rem]">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="border-b border-muted" />
                    ))}
                  </div>

                  {/* 근무 시간 표시 */}
                  {workData?.map((work: WorkHours, index: number) => {
                    const startTime = work.startTime || null;
                    const endTime = work.endTime || null;

                    return (
                      <div
                        key={index}
                        className={cn(
                          "absolute left-1 right-1 rounded-md p-2 text-xs shadow-sm",
                          !endTime && "animate-pulse",
                          "text-card-foreground"
                        )}
                        style={{
                          top: `${getTimePosition(startTime)}rem`,
                          height: endTime
                            ? `${
                                getTimePosition(endTime) -
                                getTimePosition(startTime)
                              }rem`
                            : "2.5rem",
                          ...getWorkStatusStyle(startTime, endTime),
                        }}
                      >
                        <div
                          className={cn(
                            "whitespace-nowrap font-medium",
                            !endTime
                              ? "text-warning-foreground"
                              : "text-foreground"
                          )}
                        >
                          {getWorkTimeText(startTime, endTime)}
                        </div>
                      </div>
                    );
                  })}

                  {/* 결근 표시 개선 */}
                  {!workData && !isSameDay(day, today) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-md px-3 py-1 bg-destructive/10 border border-destructive/30">
                        <span className="text-xs font-medium text-destructive">
                          결근
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
