import {
  differenceInMinutes,
  endOfWeek,
  max,
  min,
  startOfWeek,
} from "date-fns";
import { AttendanceRecordWithUser } from "@/types/attendance";

/**
 * Calculate overlap minutes between a work segment and an interval.
 * Handles edge cases such as overnight work and open-ended segments (checkOut === null).
 */
export const overlapMinutes = (
  segStart: Date,
  segEnd: Date | null,
  intStart: Date,
  intEnd: Date,
  now: Date = new Date()
): number => {
  const effectiveEnd = segEnd ?? now; // 진행 중 근무
  if (effectiveEnd <= intStart || segStart >= intEnd) return 0;
  const start = max([segStart, intStart]);
  const end = min([effectiveEnd, intEnd]);
  return start < end ? differenceInMinutes(end, start) : 0;
};

/**
 * Sum work minutes for a list of records inside the given interval.
 */
export const sumWorkMinutes = (
  records: AttendanceRecordWithUser[],
  intStart: Date,
  intEnd: Date
): number => {
  return records.reduce((acc, record) => {
    const segStart = new Date(record.checkInTime);
    const segEnd = record.checkOutTime ? new Date(record.checkOutTime) : null;
    return acc + overlapMinutes(segStart, segEnd, intStart, intEnd);
  }, 0);
};

export interface WeeklyStat {
  weekLabel: string; // "1주차", "2주차" 등
  start: Date;
  end: Date;
  totalMinutes: number;
}

/**
 * Build weekly stats for the month that monthDate belongs to.
 * The "1주차" is defined by ISO week starting Monday.
 */
export const buildWeeklyStats = (
  records: AttendanceRecordWithUser[],
  monthDate: Date
): WeeklyStat[] => {
  const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

  let cursor = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  let index = 1;
  const list: WeeklyStat[] = [];
  while (cursor <= lastDayOfMonth) {
    const weekStart = cursor;
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
    const total = sumWorkMinutes(records, weekStart, weekEnd);
    list.push({
      weekLabel: `${index}주차`,
      start: weekStart,
      end: weekEnd,
      totalMinutes: total,
    });
    cursor = new Date(weekEnd.getTime() + 1000); // next millisecond after end
    index += 1;
  }
  return list;
};
