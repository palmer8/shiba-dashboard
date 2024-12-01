export type PenaltyType = "경고" | "게임정지" | "구두경고" | "정지해제";

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

export type AddIncidentReportData = {
  reason: string;
  incidentDescription: string;
  incidentTime: Date;
  targetUserId: number;
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
  penaltyType: PenaltyType;
  warningCount?: number | null;
  detentionTimeMinutes?: number | null;
  banDurationHours?: number | null;
  admin: string;
  userId: string;
};

export type EditWhitelistData = {
  id: number;
  user_ip?: string;
  comment?: string;
  status?: number;
};

export type AddWhitelistData = {
  user_ip: string[];
  status?: number;
  comment?: string;
};

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

export type ReportResponse = {
  records: IncidentReport[];
  total: number;
  page: number;
  totalPages: number;
};

export type WhitelistResponse = {
  records: WhitelistIP[];
  total: number;
  page: number;
  totalPages: number;
};

export type AddBlockTicketData = {
  userId: string;
  reportId: number;
};
