import { BlockTicket } from "@prisma/client";
import { ApiResponse } from "./global.dto";

// 기본 타입 정의
export type PenaltyType = "경고" | "게임정지" | "구두경고" | "정지해제";

// DB 테이블 타입 정의
export type IncidentReport = {
  report_id: number;
  reason: string;
  incident_description: string;
  incident_time: Date;
  target_user_id: number;
  target_user_nickname: string;
  reporting_user_id: number;
  reporting_user_nickname: string;
  penalty_type: PenaltyType;
  warning_count: number | null;
  detention_time_minutes: number | null;
  ban_duration_hours: number | null;
  image: string | null;
  admin: string;
};

export type WhitelistIP = {
  id: number;
  user_ip: string;
  status: number;
  comment: string | null;
  registrant: string;
  date: Date;
};

// API 요청 데이터 타입
export type AddIncidentReportData = {
  reason: string;
  incidentDescription: string;
  incidentTime: Date;
  targetUserId: number;
  image: string | null;
  targetUserNickname: string;
  reportingUserId?: number;
  reportingUserNickname?: string;
  penaltyType: PenaltyType;
  warningCount: number | null;
  detentionTimeMinutes: number | null;
  banDurationHours: number | null;
};

export type EditIncidentReportData = {
  reportId: number;
  reason: string;
  incidentDescription: string;
  incidentTime: Date;
  image: string | null;
  targetUserId: number;
  targetUserNickname: string;
  reportingUserId?: number;
  reportingUserNickname?: string;
  penaltyType: PenaltyType;
  warningCount?: number | null;
  detentionTimeMinutes?: number | null;
  banDurationHours?: number | null;
};

export type AddWhitelistData = {
  user_ip: string[];
  status?: number;
  comment?: string;
};

export type EditWhitelistData = {
  id: number;
  user_ip?: string;
  comment?: string;
  status?: number;
};

// 필터 타입
export type ReportFilters = {
  page: number;
  penalty_type?: PenaltyType;
  reason?: string;
  target_user_id?: string;
  reporting_user_id?: string;
  admin?: string;
  incident_time?: Date[];
};

export type WhitelistFilters = {
  page: number;
  user_ip?: string;
  comment?: string;
  registrant?: string;
  date?: Date[];
};

// API 응답 타입
export type ReportActionResponse = ApiResponse<number | null>;
export type WhitelistActionResponse = ApiResponse<number | null>;
export type BlockTicketActionResponse = ApiResponse<number | null>;

export type ReportListResponse = ApiResponse<{
  records: IncidentReport[];
  total: number;
  page: number;
  totalPages: number;
}>;

export type WhitelistListResponse = ApiResponse<{
  records: WhitelistIP[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
}>;

// Block Ticket 관련 타입
export type AddBlockTicketData = {
  reportId: number;
};

export interface BlockTicketListResponse
  extends ApiResponse<{
    records: (BlockTicket & {
      registrant: { id: string; nickname: string; userId: number };
    })[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  }> {}

// 서비스 응답 타입
export type ReportServiceResponse<T> = ApiResponse<T>;
