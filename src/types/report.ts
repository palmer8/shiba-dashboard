import { Session } from "next-auth";

export type IncidentReport = {
  report_id: number;
  reason: string;
  incident_description: string;
  incident_time: Date;
  target_user_id: number;
  target_user_nickname: string;
  reporting_user_id: number;
  reporting_user_nickname: string;
  penalty_type: string;
  warning_count: number | null;
  detention_time_minutes: number | null;
  ban_duration_hours: number | null;
  admin: string;
};

export type WhitelistIP = {
  id: number;
  user_ip: string;
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
  reportingUserId: number;
  reportingUserNickname: string;
  penaltyType: string;
  warningCount: number | null;
  detentionTimeMinutes: number | null;
  banDurationHours: number | null;
  admin: string;
  isTicket: boolean;
  session: Session;
};

export type EditIncidentReportData = {
  reportId: number;
  reason: string;
  incidentDescription: string;
  incidentTime: Date;
  penaltyType: string;
  warningCount?: number | null;
  detentionTimeMinutes?: number | null;
  banDurationHours?: number | null;
  admin: string;
  userId: string;
};

export type AddWhitelistData = {
  user_ip: string[];
  comment?: string;
  session: Session;
};

export type ReportFilters = {
  page: number;
  penalty_type?: string;
  reason?: string;
  target_user_id?: string;
  reporting_user_id?: string;
  admin?: string;
  incident_time?: Date[];
};

export type WhitelistFilters = {
  user_ip?: string;
  comment?: string;
  registrant?: string;
  date?: Date[];
};
