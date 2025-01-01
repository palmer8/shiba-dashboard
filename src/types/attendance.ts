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

// 가공된 출퇴근 기록 타입
export interface ProcessedRecord {
  date: string;
  in: string | null;
  out: string | null;
  displayIn: string | null;
  displayOut: string | null;
  isOvernight: boolean;
  workHours: string;
}

// 차트 데이터 타입
export interface ChartData {
  date: string;
  hours: number;
  expected: number;
}

// 통계 데이터 타입
export interface AttendanceStats {
  averageTimes: {
    in: string;
    out: string;
  };
  weeklyStats: ChartData[];
}

// 가공된 관리자 출퇴근 데이터 타입
export interface ProcessedAdminAttendance {
  userId: number;
  nickname: string;
  records: ProcessedRecord[];
  today: {
    in: string | null;
    out: string | null;
  };
  stats: AttendanceStats;
  workHours: WorkHoursData;
}

// API 응답 타입
export interface AttendanceResponse {
  success: boolean;
  error: string | null;
  data: ProcessedAdminAttendance[] | null;
}

// 컴포넌트 Props 타입들
export interface AttendanceCalendarProps {
  data: WorkHoursData;
  date: DateRange | undefined;
  adminId: number;
}

export interface AttendanceListProps {
  attendances: ProcessedAdminAttendance[];
  expandedAdmin: number | null;
  onExpand: (id: number | null) => void;
  date: DateRange | undefined;
}

export interface AttendanceStatsProps {
  data: ProcessedAdminAttendance[];
  dateRange?: DateRange;
}

export interface AttendanceFilterProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export interface AttendanceViewerProps {
  attendances?: ProcessedAdminAttendance[];
}
