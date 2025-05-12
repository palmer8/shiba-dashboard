import { DateRange } from "react-day-picker";
import { AttendanceRecord, User } from "@prisma/client";

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

// API 응답에 맞춰 User 객체의 특정 필드만 포함하는 타입
// API에서 select 하는 필드와 일치해야 함
export type SelectedUserFields = Pick<
  User,
  "id" | "userId" | "nickname" | "image" | "role"
>;

// Prisma의 AttendanceRecord 모델에 선택된 User 필드를 포함
export type AttendanceRecordWithUser = AttendanceRecord & {
  user: SelectedUserFields;
};

// 사용자 목록이나 선택 등에 사용될 간소화된 User 타입
export type SimplifiedUser = Pick<
  User,
  "id" | "userId" | "nickname" | "image" | "role"
>;

// 달력 및 타임라인 차트에 사용될 하루의 근무 세그먼트
export interface WorkSegment {
  startTime: Date;
  endTime: Date;
  isOvernightStart?: boolean;
  isOvernightEnd?: boolean;
  status?: "근무중" | "휴식" | "기타";
}

// AttendanceCalendar에 전달될 날짜별/사용자별 근무 데이터
export interface CalendarUserData {
  userNumericId: number; // User.userId (Int)
  nickname: string;
  image?: string | null;
  days: {
    [date: string]: {
      // "YYYY-MM-DD"
      totalWorkHoursText: string;
      segments: WorkSegment[];
    };
  };
}

// AttendanceStats에서 사용할 주간/일간 근무 시간 데이터
export interface WorkTrendData {
  date: string; // "MM/dd" 또는 "YYYY-MM-DD"
  workHours: number;
  averageInTime?: string; // "HH:mm"
  averageOutTime?: string; // "HH:mm"
}

// AttendanceCalendar Props
export interface AttendanceCalendarProps {
  records: AttendanceRecordWithUser[];
  users?: SimplifiedUser[];
  currentDateRange: DateRange | undefined;
  targetUserNumericId?: number;
}

// AttendanceStats Props
export interface AttendanceStatsProps {
  records: AttendanceRecordWithUser[];
  targetUserNumericId?: number; // User.userId (Int)
  dateRange?: DateRange;
}

// attendance-viewer.tsx 에서 page.tsx로부터 받는 데이터 타입
export interface AttendancePageData {
  initialRecords: AttendanceRecordWithUser[];
  users: SimplifiedUser[];
  initialDateRange: { from: Date; to: Date };
}
