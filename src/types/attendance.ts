import { DateRange } from "react-day-picker";

export interface WorkHours {
  startTime: string | null;
  endTime: string | null;
}

export interface WorkHoursData {
  [date: string]: WorkHours[];
}

export interface AttendanceCalendarProps {
  date: DateRange | undefined;
  adminId: string;
  data?: WorkHoursData;
}

export interface Admin {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  todayAttendance?: {
    startTime?: string | null;
    endTime?: string | null;
  };
  workHours: WorkHoursData;
  weeklyStats: {
    date: string;
    hours: number;
    expected: number;
  }[];
}

export interface AttendanceStats {
  averageWorkHours: number;
  totalWorkDays: number;
  onTimeRate: number;
  overtimeRate: number;
}

export interface MockAttendanceData {
  workHours: WorkHoursData;
  weeklyStats: Array<{
    date: string;
    hours: number;
    expected: number;
  }>;
}
