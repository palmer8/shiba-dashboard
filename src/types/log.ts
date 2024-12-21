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
