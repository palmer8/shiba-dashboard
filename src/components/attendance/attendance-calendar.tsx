"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
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
} from "date-fns";
import { ko } from "date-fns/locale";
import { AttendanceCalendarProps, SimplifiedUser } from "@/types/attendance";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 30분 단위 시간 슬롯을 위한 타입
interface TimeSlots {
  [key: string]: number; // 예: "t0_0" (0시 0분), "t0_30" (0시 30분)
}

interface ChartDataRecord {
  date: string;
  dayLabel: string;
  slots: TimeSlots; // 시간 슬롯 데이터를 별도 객체로 관리
  totalWorkTimeToday?: string;
  user?: SimplifiedUser;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length && payload[0].value !== undefined) {
    const data: ChartDataRecord = payload[0].payload;
    const slotKey = payload[0].dataKey as string;

    let hour = NaN;
    let minute = NaN;

    if (slotKey && typeof slotKey === "string" && slotKey.startsWith("t")) {
      const parts = slotKey.substring(1).split("_");
      if (parts.length === 2) {
        hour = parseInt(parts[0]);
        minute = parseInt(parts[1]);
      }
    }

    let userName = data.user?.nickname || "";
    // NaN 체크 후 시간 범위 생성
    const timeRange =
      !isNaN(hour) && !isNaN(minute)
        ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(
            2,
            "0"
          )} - ${String(hour).padStart(2, "0")}:${String(minute + 29).padStart(
            2,
            "0"
          )}`
        : "시간 정보 없음";

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
        <p className="font-medium mb-1">
          {data.dayLabel}
          {userName ? ` (${userName})` : ""}
        </p>
        <p>시간: {timeRange}</p>
        <p
          className={
            payload[0].value === 1 ? "text-primary" : "text-muted-foreground"
          }
        >
          상태: {payload[0].value === 1 ? "근무" : "근무 아님"}
        </p>
        {data.totalWorkTimeToday && (
          <p>당일 총 근무: {data.totalWorkTimeToday}</p>
        )}
      </div>
    );
  }
  return null;
};

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

  const processDataForChart = (): ChartDataRecord[] => {
    const processed: ChartDataRecord[] = [];
    if (!currentDateRange || !currentDateRange.from || !currentDateRange.to)
      return processed;

    const daysInView = eachDayOfInterval({
      start: startOfDay(currentDateRange.from),
      end: startOfDay(currentDateRange.to),
    });

    const filteredRecords = targetUserNumericId
      ? records.filter((r) => r.userNumericId === targetUserNumericId)
      : records;

    let currentUser: SimplifiedUser | undefined = undefined;
    if (targetUserNumericId && users) {
      currentUser = users.find(
        (u: SimplifiedUser) => u.userId === targetUserNumericId
      );
    } else if (filteredRecords.length > 0 && filteredRecords[0].user) {
      currentUser = filteredRecords[0].user;
    }

    daysInView.forEach((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      const dayLabel = format(day, "MM/dd (EE)", { locale: ko });
      const initialSlots: TimeSlots = {};
      for (let h = 0; h < 24; h++) {
        initialSlots[`t${h}_0`] = 0;
        initialSlots[`t${h}_30`] = 0;
      }

      const recordForDay: ChartDataRecord = {
        date: dayKey,
        dayLabel: dayLabel,
        user: currentUser,
        slots: initialSlots,
      };
      let totalMinutesToday = 0;

      filteredRecords.forEach((attRecord) => {
        if (!attRecord.checkInTime || !isValid(new Date(attRecord.checkInTime)))
          return;

        const checkIn = new Date(attRecord.checkInTime);
        const checkOut =
          attRecord.checkOutTime && isValid(new Date(attRecord.checkOutTime))
            ? new Date(attRecord.checkOutTime)
            : null;

        if (!checkOut) return;

        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const segmentStart = max([checkIn, dayStart]);
        const segmentEnd = min([checkOut, dayEnd]);

        if (segmentStart < segmentEnd) {
          let currentSlotTime = startOfDay(segmentStart);
          currentSlotTime = new Date(
            currentSlotTime.getFullYear(),
            currentSlotTime.getMonth(),
            currentSlotTime.getDate(),
            getHours(segmentStart),
            getMinutes(segmentStart) < 30 ? 0 : 30
          );

          while (currentSlotTime < segmentEnd) {
            const slotHour = getHours(currentSlotTime);
            const slotMinute = getMinutes(currentSlotTime);
            const slotKey = `t${slotHour}_${slotMinute}`;

            const slotEndBoundary = addMinutes(currentSlotTime, 30);
            if (
              max([currentSlotTime, segmentStart]) <
              min([slotEndBoundary, segmentEnd])
            ) {
              if (recordForDay.slots.hasOwnProperty(slotKey)) {
                recordForDay.slots[slotKey] = 1;
              }
            }
            currentSlotTime = addMinutes(currentSlotTime, 30);
          }

          // 당일 총 근무시간 계산 로직 수정
          // segmentStart와 segmentEnd는 이미 해당 'day' 기준으로 잘린 실제 근무 시간이므로, 이걸 사용
          if (
            isValid(segmentStart) &&
            isValid(segmentEnd) &&
            segmentEnd > segmentStart
          ) {
            totalMinutesToday += differenceInMinutes(segmentEnd, segmentStart);
          }
        }
      });

      if (totalMinutesToday > 0) {
        const hours = Math.floor(totalMinutesToday / 60);
        const minutes = totalMinutesToday % 60;
        recordForDay.totalWorkTimeToday = `${hours}시간 ${minutes}분`;
      }
      processed.push(recordForDay);
    });
    return processed.reverse();
  };

  const chartData = processDataForChart();

  const timeSlotKeys = useMemo(() => {
    const keys = [];
    for (let h = 0; h < 24; h++) {
      keys.push(`t${h}_0`);
      keys.push(`t${h}_30`);
    }
    return keys;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {currentUserNickname
            ? `${currentUserNickname}님의 타임라인`
            : "타임라인"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-0 pr-2 pb-2 pt-0">
        <ResponsiveContainer
          width="100%"
          height={Math.max(300, chartData.length * 40)}
        >
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              domain={[0, 24]}
              ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]}
              tickFormatter={(value) => `${value}시`}
              allowDecimals={false}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="dayLabel"
              width={75}
              fontSize={12}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
            />

            {timeSlotKeys.map((slotKey) => (
              <Bar
                key={slotKey}
                dataKey={`slots.${slotKey}`} // Cell 내부에서 entry.slots[slotKey]로 접근하도록 dataKey 수정
                stackId="workTime"
                barSize={18}
              >
                {chartData.map((entry, entryIndex) => (
                  <Cell
                    key={`cell-${entryIndex}-${slotKey}`}
                    fill={
                      entry.slots && entry.slots[slotKey] === 1 // 수정된 접근 방식
                        ? "hsl(var(--primary))"
                        : "hsl(var(--card))"
                    }
                    radius={0}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
