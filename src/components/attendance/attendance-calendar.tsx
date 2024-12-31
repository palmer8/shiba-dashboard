"use client";

import { cn } from "@/lib/utils";
import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isWeekend,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AttendanceCalendarProps, WorkHours } from "@/types/attendance";

// 시간을 위치값으로 변환하는 함수
const getTimePosition = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 2.5 + (minutes / 60) * 2.5;
};

// 근무 시간이 24시를 넘어가는 경우 분할하는 함수
const splitOvernightWork = (
  work: WorkHours,
  currentDate: string
): {
  current: WorkHours;
  next?: { date: string; work: WorkHours };
} => {
  if (!work.endTime) return { current: work };

  const [startHour] = work.startTime.split(":").map(Number);
  const [endHour] = work.endTime.split(":").map(Number);

  if (endHour < startHour || (endHour === 0 && startHour > 0)) {
    const nextDate = format(addDays(new Date(currentDate), 1), "yyyy-MM-dd");
    return {
      current: {
        startTime: work.startTime,
        endTime: "24:00",
      },
      next: {
        date: nextDate,
        work: {
          startTime: "00:00",
          endTime: work.endTime,
        },
      },
    };
  }

  return { current: work };
};

// 근무 상태에 따른 스타일 반환 함수
const getWorkStatusStyle = (startTime: string, endTime: string | null) => {
  return {
    backgroundColor: endTime
      ? "hsl(var(--primary) / 0.15)"
      : "hsl(var(--warning) / 0.15)",
    borderLeft: `3px solid ${
      endTime ? "hsl(var(--primary))" : "hsl(var(--warning))"
    }`,
    borderRadius: "0.375rem",
    borderTop: `1px solid ${
      endTime ? "hsl(var(--primary) / 0.3)" : "hsl(var(--warning) / 0.3)"
    }`,
    borderBottom: `1px solid ${
      endTime ? "hsl(var(--primary) / 0.3)" : "hsl(var(--warning) / 0.3)"
    }`,
    borderRight: `1px solid ${
      endTime ? "hsl(var(--primary) / 0.3)" : "hsl(var(--warning) / 0.3)"
    }`,
  };
};

// 근무 시간 텍스트 반환 함수
const getWorkTimeText = (
  startTime: string,
  endTime: string | null,
  isPreviousDayWork: boolean = false
): string => {
  if (!endTime) return `${startTime} - 근무중 ⌛`;

  // 이전 날짜에서 이어진 근무인 경우 "작일" 표시
  if (isPreviousDayWork) {
    return `${startTime} - ${endTime} (작일)`;
  }

  // 다음 날까지 이어지는 경우 "익일" 표시
  const isNextDay = endTime < startTime;
  return `${startTime} - ${endTime}${isNextDay ? " (익일)" : ""}`;
};

export function AttendanceCalendar({
  data,
  date,
  adminId,
}: AttendanceCalendarProps) {
  if (!date?.from || !date?.to) return null;

  const days = eachDayOfInterval({
    start: date.from,
    end: date.to,
  });

  const weeks = days.reduce<Date[][]>((acc, day) => {
    const weekIndex = Math.floor(days.indexOf(day) / 7);
    acc[weekIndex] = acc[weekIndex] || [];
    acc[weekIndex].push(day);
    return acc;
  }, []);

  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const today = new Date();

  // 다음 날로 이어지는 근무 시간을 저장할 맵
  const nextDayWorkMap = new Map<
    string,
    Array<{
      startTime: string;
      endTime: string;
    }>
  >();

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

        {/* 캘린더 그리드 */}
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

          <div className="grid grid-cols-7 divide-x">
            {weeks[currentWeekIndex].map((day, dayIndex) => {
              const formattedDate = format(day, "yyyy-MM-dd");
              const workData = data?.[formattedDate] || [];
              const nextDayWork = nextDayWorkMap.get(formattedDate) || [];
              const isToday = isSameDay(day, today);

              // 현재 날짜의 근무 데이터 처리
              workData.forEach((work: WorkHours) => {
                const { current, next } = splitOvernightWork(
                  work,
                  formattedDate
                );
                if (next) {
                  const existingNextDay = nextDayWorkMap.get(next.date) || [];
                  nextDayWorkMap.set(next.date, [
                    ...existingNextDay,
                    {
                      startTime: work.startTime,
                      endTime: work.endTime!,
                    },
                  ]);
                }
              });

              return (
                <div
                  key={formattedDate}
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

                  {/* 현재 날짜의 근무 시간 */}
                  {workData.map((work: WorkHours, index: number) => {
                    const { current } = splitOvernightWork(work, formattedDate);
                    return (
                      <div
                        key={`${formattedDate}-current-${index}-${work.startTime}`}
                        className={cn(
                          "absolute left-1 right-1 p-2 text-xs shadow-sm",
                          !work.endTime && "animate-pulse"
                        )}
                        style={{
                          top: `${getTimePosition(current.startTime)}rem`,
                          height: `${
                            getTimePosition(current.endTime || "24:00") -
                            getTimePosition(current.startTime)
                          }rem`,
                          ...getWorkStatusStyle(
                            current.startTime,
                            current.endTime
                          ),
                        }}
                      >
                        <div className="whitespace-nowrap font-medium">
                          {getWorkTimeText(current.startTime, work.endTime)}
                        </div>
                      </div>
                    );
                  })}

                  {/* 이전 날짜에서 이어진 근무 시간 */}
                  {nextDayWork.map(({ startTime, endTime }, index) => (
                    <div
                      key={`${formattedDate}-next-${index}-${startTime}`}
                      className="absolute left-1 right-1 p-2 text-xs shadow-sm"
                      style={{
                        top: 0,
                        height: `${getTimePosition(endTime)}rem`,
                        ...getWorkStatusStyle(startTime, endTime),
                      }}
                    >
                      <div className="whitespace-nowrap font-medium">
                        {getWorkTimeText(startTime, endTime, true)}
                      </div>
                    </div>
                  ))}

                  {!workData && !isToday && !isWeekend(day) && (
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
