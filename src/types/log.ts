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
  startDate?: string;
  endDate?: string;
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
  databaseLogs?: number; // 데이터베이스 로그 수 추가
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

export interface RecipeLog {
  id: number;
  user_id: number;
  recipe_id: string;
  reward_item: string;
  create_time: Date;
}

export interface RecipeLogResponse {
  records: RecipeLog[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export interface RecipeLogFilter {
  page?: number;
  userId?: string;
  recipeId?: string;
  rewardItem?: string;
  startDate?: string;
  endDate?: string;
}
