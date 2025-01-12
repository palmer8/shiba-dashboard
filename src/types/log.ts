export type AdminLog = {
  id: string;
  content: string;
  registrantId: string | null;
  registrantUserId: number | null;
  registrantNickname: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminLogFilters = {
  page?: number;
  content?: string;
  registrantUserId?: number;
  date?: [Date, Date];
};

export type AdminLogListResponse = {
  records: AdminLog[];
  total: number;
  page: number;
  totalPages: number;
};

export interface GameLogFilters {
  type?: string;
  level?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  message?: string;
}

export interface GameLogResponse {
  records: Array<{
    id: number;
    timestamp: Date;
    level: string;
    type: string;
    message: string;
    metadata?: any;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export interface StaffLog {
  staff_id: number;
  staff_name: string;
  target_id: number;
  target_name: string;
  description: string;
  time: Date;
}

export interface StaffLogFilter {
  staffId?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}

export interface StaffLogResponse {
  records: StaffLog[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}
