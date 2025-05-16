"use client";

import {
  format,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  getMinutes,
  getHours,
  isValid,
  min,
  max,
  addMinutes,
  differenceInMinutes,
  isWithinInterval,
  parse,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  AttendanceCalendarProps,
  AttendanceRecordWithUser,
  SimplifiedUser,
} from "@/types/attendance";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ChartDataRecord 인터페이스는 그대로 사용
interface ChartDataRecord {
  id: string;
  dayLabel: string;
  userNickname?: string;
  workInterval: [number, number];
  checkInTime: string;
  checkOutTime: string;
  workDurationMinutes: number;
}

// 시간 변환 및 포맷팅 헬퍼 함수들은 그대로 사용
const timeToNumeric = (date: Date): number => {
  return getHours(date) + getMinutes(date) / 60;
};

const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
  if (isNaN(totalMinutes) || totalMinutes < 0) return "-";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ""}`.trim();
};

// 새로운 툴팁 데이터 및 위치 상태 인터페이스
interface TooltipInfo {
  data: ChartDataRecord;
  top: number;
  left: number;
}

export function AttendanceCalendar({
  records,
  users,
  currentDateRange,
  targetUserNumericId,
}: AttendanceCalendarProps) {
  const currentUserNickname = useMemo(() => {
    if (targetUserNumericId && users) {
      return users.find((u: SimplifiedUser) => u.userId === targetUserNumericId)
        ?.nickname;
    }
    return undefined;
  }, [targetUserNumericId, users]);

  const yAxisDayLabels = useMemo(() => {
    // 이 로직은 이전과 동일하게 유지 (중복 없는 날짜 레이블 배열 생성)
    if (!currentDateRange?.from || !currentDateRange?.to) {
      return [];
    }
    const dayLabels = new Set<string>();
    const range = {
      start: startOfDay(currentDateRange.from),
      end: startOfDay(currentDateRange.to),
    };
    if (range.start > range.end) {
      dayLabels.add(format(range.start, "MM/dd (EE)", { locale: ko }));
    } else {
      const daysInView = eachDayOfInterval(range);
      daysInView.forEach((day) => {
        dayLabels.add(format(day, "MM/dd (EE)", { locale: ko }));
      });
    }
    let finalLabels = Array.from(new Set(Array.from(dayLabels)));
    finalLabels.sort();
    finalLabels.reverse();
    return finalLabels;
  }, [currentDateRange]);

  const chartData = useMemo((): ChartDataRecord[] => {
    // 이 로직은 이전과 동일하게 유지 (차트 데이터 가공)
    if (
      !currentDateRange ||
      !currentDateRange.from ||
      !currentDateRange.to ||
      yAxisDayLabels.length === 0
    ) {
      return [];
    }
    const processedRecords: ChartDataRecord[] = [];
    const viewStartDate = startOfDay(currentDateRange.from);
    const viewEndDate = endOfDay(currentDateRange.to);

    const filteredUserRecords = targetUserNumericId
      ? records.filter((r) => r.userNumericId === targetUserNumericId)
      : records;

    filteredUserRecords.forEach((attRecord) => {
      if (
        !attRecord.checkInTime ||
        !attRecord.checkOutTime ||
        !isValid(new Date(attRecord.checkInTime)) ||
        !isValid(new Date(attRecord.checkOutTime))
      ) {
        return;
      }
      const checkIn = new Date(attRecord.checkInTime);
      const checkOut = new Date(attRecord.checkOutTime);
      let currentDateIter = startOfDay(checkIn);
      while (currentDateIter <= checkOut && currentDateIter <= viewEndDate) {
        if (currentDateIter < viewStartDate) {
          currentDateIter = startOfDay(addMinutes(currentDateIter, 24 * 60));
          continue;
        }
        const dayStart = startOfDay(currentDateIter);
        const dayEnd = endOfDay(currentDateIter);
        const segmentStart = max([checkIn, dayStart]);
        const segmentEnd = min([checkOut, dayEnd]);

        if (segmentStart < segmentEnd) {
          const numericStartTime = timeToNumeric(segmentStart);
          let numericEndTime = timeToNumeric(segmentEnd);
          if (
            numericEndTime === 0 &&
            !isWithinInterval(segmentStart, { start: dayStart, end: dayEnd })
          ) {
            if (
              differenceInMinutes(segmentEnd, segmentStart) > 0 &&
              getHours(segmentEnd) === 0 &&
              getMinutes(segmentEnd) === 0
            ) {
              numericEndTime = 24;
            }
          }
          if (
            numericStartTime === 0 &&
            numericEndTime === 0 &&
            differenceInMinutes(segmentEnd, segmentStart) >= 24 * 60 - 1
          ) {
            numericEndTime = 24;
          }
          if (numericStartTime < numericEndTime) {
            processedRecords.push({
              id: `${attRecord.id}_${format(dayStart, "yyyyMMdd")}`,
              dayLabel: format(dayStart, "MM/dd (EE)", { locale: ko }),
              userNickname: attRecord.user?.nickname || currentUserNickname,
              workInterval: [numericStartTime, numericEndTime],
              checkInTime: attRecord.checkInTime.toISOString(),
              checkOutTime: attRecord.checkOutTime.toISOString(),
              workDurationMinutes: differenceInMinutes(checkOut, checkIn),
            });
          }
        }
        currentDateIter = startOfDay(addMinutes(currentDateIter, 24 * 60));
      }
    });
    processedRecords.sort((a, b) => {
      const aIndex = yAxisDayLabels.indexOf(a.dayLabel);
      const bIndex = yAxisDayLabels.indexOf(b.dayLabel);
      if (aIndex === -1 && bIndex !== -1) return 1;
      if (aIndex !== -1 && bIndex === -1) return -1;
      if (aIndex === -1 && bIndex === -1) {
        const dateAVal = parse(a.dayLabel, "MM/dd (EE)", new Date()).getTime();
        const dateBVal = parse(b.dayLabel, "MM/dd (EE)", new Date()).getTime();
        if (dateAVal > dateBVal) return -1;
        if (dateAVal < dateBVal) return 1;
        return a.workInterval[0] - b.workInterval[0];
      }
      if (aIndex < bIndex) return -1;
      if (aIndex > bIndex) return 1;
      return a.workInterval[0] - b.workInterval[0];
    });
    return processedRecords;
  }, [
    records,
    users,
    currentDateRange,
    targetUserNumericId,
    currentUserNickname,
    yAxisDayLabels,
  ]);

  const [activeTooltip, setActiveTooltip] = useState<TooltipInfo | null>(null);

  const handleShowTooltip = (
    record: ChartDataRecord,
    event: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>
  ) => {
    const barRect = event.currentTarget.getBoundingClientRect();
    const chartAreaContainer = event.currentTarget.closest(
      '[data-chart-area="true"]'
    );
    const chartAreaRect = chartAreaContainer?.getBoundingClientRect();

    let top = barRect.top - (chartAreaRect?.top || 0) + barRect.height / 2;
    let left = barRect.left - (chartAreaRect?.left || 0) + barRect.width;

    if (chartAreaRect) {
      const tooltipEstimatedWidth = 180;
      const tooltipEstimatedHeight = 100;

      if (left + tooltipEstimatedWidth > chartAreaRect.width) {
        left =
          barRect.left - (chartAreaRect?.left || 0) - tooltipEstimatedWidth - 5;
      }
      if (left < 0) {
        left = 5;
      }
      if (top + tooltipEstimatedHeight > chartAreaRect.height) {
        top =
          barRect.top -
          (chartAreaRect?.top || 0) -
          tooltipEstimatedHeight +
          barRect.height / 2;
      }
      if (top < 0) {
        top = 5;
      }
    }

    setActiveTooltip({ data: record, top, left });
  };

  const handleHideTooltip = () => {
    setActiveTooltip(null);
  };

  if (!currentDateRange || !currentDateRange.from || !currentDateRange.to) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {currentUserNickname
              ? `${currentUserNickname}님의 타임라인`
              : "타임라인"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="p-4 text-center text-muted-foreground">
            날짜 범위를 선택해주세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hourLabels = Array.from({ length: 13 }, (_, i) => i * 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {currentUserNickname
            ? `${currentUserNickname}님의 타임라인`
            : "타임라인"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pr-4 pl-2 py-4 relative" data-chart-area="true">
        <div className="flex text-xs text-muted-foreground">
          <div className="w-20 shrink-0"></div>
          <div className="flex-1 grid grid-cols-12">
            {hourLabels.slice(0, -1).map((hour) => (
              <div key={`xlabel-${hour}`} className="text-center">
                {hour}시
              </div>
            ))}
          </div>
          <div className="w-6 shrink-0"></div>
        </div>

        <div className="flex mt-1">
          <div className="w-20 shrink-0 space-y-1">
            {yAxisDayLabels.map((label) => (
              <div
                key={`ylabel-${label}`}
                className="h-10 flex items-center justify-end pr-2 text-xs text-muted-foreground"
              >
                {label}
              </div>
            ))}
            {yAxisDayLabels.length === 0 && <div className="h-10"></div>}
          </div>

          <div className="flex-1 relative border-l border-muted">
            {yAxisDayLabels.map((label, dayIndex) => (
              <div
                key={`row-${label}`}
                className={cn(
                  "h-10 relative",
                  dayIndex < yAxisDayLabels.length - 1
                    ? "border-b border-dashed border-muted"
                    : ""
                )}
              >
                {chartData
                  .filter((d) => d.dayLabel === label)
                  .map((record) => {
                    const leftPercent = (record.workInterval[0] / 24) * 100;
                    const widthPercent =
                      ((record.workInterval[1] - record.workInterval[0]) / 24) *
                      100;
                    return (
                      <div
                        key={record.id}
                        className="absolute bg-blue-500 rounded top-[20%] h-[60%] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 cursor-pointer"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${Math.max(0.5, widthPercent)}%`,
                        }}
                        onMouseEnter={(e) => handleShowTooltip(record, e)}
                        onMouseLeave={handleHideTooltip}
                        onFocus={(e) => handleShowTooltip(record, e)}
                        onBlur={handleHideTooltip}
                        tabIndex={0}
                        aria-label={`근무: ${format(
                          new Date(record.checkInTime),
                          "HH:mm"
                        )} - ${
                          record.checkOutTime
                            ? format(new Date(record.checkOutTime), "HH:mm")
                            : "진행중"
                        }, ${record.userNickname || ""}`}
                      ></div>
                    );
                  })}
              </div>
            ))}
            {hourLabels.map((hour) => (
              <div
                key={`vline-${hour}`}
                className="absolute top-0 bottom-0 border-l border-dashed border-muted -z-10"
                style={{ left: `${(hour / 24) * 100}%` }}
              ></div>
            ))}
            <div className="absolute -top-5 right-0 text-xs text-muted-foreground pr-1">
              24시
            </div>
          </div>
        </div>

        {activeTooltip && (
          <div
            className="absolute z-20 rounded-lg border bg-popover text-popover-foreground p-2 shadow-md text-xs min-w-[180px] pointer-events-none"
            style={{
              top: activeTooltip.top,
              left: activeTooltip.left,
              transform: "translateY(-50%)",
            }}
          >
            <p className="font-medium mb-1">
              {activeTooltip.data.dayLabel}{" "}
              {activeTooltip.data.userNickname
                ? `(${activeTooltip.data.userNickname})`
                : ""}
            </p>
            <hr className="my-1" />
            <p>
              출근: {format(new Date(activeTooltip.data.checkInTime), "HH:mm")}
            </p>
            <p>
              퇴근:{" "}
              {activeTooltip.data.checkOutTime
                ? format(new Date(activeTooltip.data.checkOutTime), "HH:mm")
                : "-"}
            </p>
            <p>
              근무:{" "}
              {formatMinutesToHoursAndMinutes(
                activeTooltip.data.workDurationMinutes
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
