export type ComparisonOperator = "gt" | "gte" | "lt" | "lte" | "eq";

export type GameDataType =
  | "CREDIT"
  | "CREDIT2"
  | "WALLET"
  | "BANK"
  | "MILEAGE"
  | "REGISTRATION"
  | "CURRENT_CASH"
  | "ACCUMULATED_CASH"
  | "ITEM_CODE"
  | "ITEM_NAME"
  | "NICKNAME"
  | "INSTAGRAM"
  | "COMPANY"
  | "IP"
  | "VEHICLE"
  | "SKIN";

export type UserLogFilter = {
  message?: string;
  createdAt?: [string, string];
  level?: string;
  type?: string;
  page?: number;
};

export interface InstagramResult {
  id: number;
  nickname: string;
  first_join: Date;
  display_name: string;
  username: string;
  phone_number: string;
  date_joined: Date;
}

export interface IpResult {
  id: number;
  nickname: string;
  first_join: Date;
  result: string;
}

export interface CompanyResult {
  id: number;
  name: string;
  capital: number;
}

export interface BaseQueryResult {
  id: number;
  nickname: string;
  first_join: Date;
  result: string;
  type: string;
}

export interface VehicleQueryResult {
  id: number;
  nickname: string;
  first_join: Date | null;
  vehicle: string;
  vehicle_plate: string | null;
}

// 새로운 파티션 로그 시스템 타입들
export interface PartitionLogData {
  id?: number;
  type: string;
  message: string;
  level?: string;
  metadata?: { [key: string]: any };
  timestamp?: string;
}

export interface PartitionLogFilter {
  type?: string;
  level?: string;
  message?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit?: number;
  userId?: number; // 유저별 로그 필터링을 위한 필드 추가
  metadata?: string; // 메타데이터 검색을 위한 필드 추가
}

export interface PartitionLogMetadata {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  memoryLogs: number;
  databaseLogs: number;
  bufferSize: number;
}

export interface LogStats {
  server: {
    uptime: number;
    memoryUsage: any;
    nodeVersion: string;
    environment: string;
  };
  logStore: {
    bufferSize: number;
    batchSize: number;
    flushInterval: number;
    isProcessing: boolean;
    lastProcessedAt: string | null;
  };
  database: {
    connectionString: string;
  };
}
