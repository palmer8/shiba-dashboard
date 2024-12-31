import { DateRange } from "react-day-picker";

// 기본 근무 시간 타입
export interface WorkHours {
  startTime: string;
  endTime: string | null;
}

// 날짜별 근무 시간 데이터
export interface WorkHoursData {
  [date: string]: WorkHours[];
}

// API 응답 타입
export interface AttendanceResponse {
  success: boolean;
  error: string | null;
  data: AdminAttendance[] | null;
}

// 관리자 출퇴근 데이터
export interface AdminAttendance {
  userId: number;
  nickname: string;
  today: {
    in: string | null;
    out: string | null;
  };
  records: {
    date: string;
    in: string;
    out: string | null;
  }[];
  weeklyStats: {
    date: string;
    hours: number;
    expected: number;
  }[];
  workHours: WorkHoursData;
}

// 컴포넌트 Props 타입
export interface AttendanceCalendarProps {
  data: WorkHoursData;
  date: DateRange | undefined;
  adminId: number;
}

export interface AttendanceListProps {
  attendances: AdminAttendance[];
  expandedAdmin: string | null;
  onExpand: (id: string | null) => void;
  date: DateRange | undefined;
}

export interface AttendanceStatsProps {
  data: AdminAttendance[];
}

export interface AttendanceFilterProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export interface AttendanceViewerProps {
  attendances?: AdminAttendance[];
}
