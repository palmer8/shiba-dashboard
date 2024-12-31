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
export interface AttendanceResponse {
  success: boolean;
  error: string | null;
  data: AdminAttendance[] | null;
}

export interface AdminAttendance {
  userId: number; // 게임 서버의 유저 ID
  nickname: string; // 게임 서버의 유저 닉네임
  role: string; // 게임 서버의 권한
  today: {
    in: string | null; // "2024-02-21T09:00:00.000Z" 형식
    out: string | null; // "2024-02-21T18:00:00.000Z" 형식
  };
}

// 상세 출퇴근 기록 응답
export interface AttendanceDetailResponse {
  success: boolean;
  error: string | null;
  data: {
    records: AttendanceRecord[];
  } | null;
}

// 출퇴근 기록
export interface AttendanceRecord {
  date: string; // "2024-02-21" 형식
  in: string | null; // "2024-02-21T09:00:00.000Z" 형식
  out: string | null; // "2024-02-21T18:00:00.000Z" 형식
}

// 상세 조회 파라미터
export interface AttendanceDetailParams {
  userId: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}
