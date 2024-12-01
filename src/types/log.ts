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
