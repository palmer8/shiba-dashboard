"use server";

import { logService, newLogService } from "@/service/log-service";
import { revalidatePath } from "next/cache";

export const exportGameLogsAction = async (ids: number[]) => {
  const result = await logService.exportGameLogs(ids);
  return result;
};

export async function getAccountUsingLogsByIdsAction(ids: string[]) {
  const result = await logService.getAccountUsingLogs(ids);
  return result;
}

export const deleteGameLogsAction = async (ids: number[]) => {
  const result = await logService.deleteGameLogs(ids);
  revalidatePath("/log/user");
  return result;
};

export const writeAdminLogAction = async (content: string) => {
  await logService.writeAdminLog(content);
};

export const getRecipeLogsAction = async (ids: number[]) => {
  const result = await logService.getRecipeLogsByIds(ids);
  return result;
};

export const getUserRelatedLogsAction = async (
  userId: number,
  page: number = 1,
  filters: {
    type: string;
    level: string;
    message: string;
  }
) => {
  const result = await logService.getUserRelatedLogs(userId, page, filters);
  return result;
};

export const exportGameLogsByDateRangeAction = async (
  startDate: string,
  endDate: string
) => {
  return await logService.exportGameLogsByDateRange(startDate, endDate);
};

export const exportAdminLogsByDateRangeAction = async (
  startDate: string,
  endDate: string
) => {
  return await logService.exportAdminLogsByDateRange(startDate, endDate);
};

// 새로운 파티션 로그 시스템 액션들
export const getPartitionLogsAction = async (filters: {
  type?: string;
  level?: string;
  message?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  metadata?: string;
}) => {
  const result = await newLogService.getPartitionLogs(filters);
  return result;
};

export const getLogStatsAction = async () => {
  const result = await newLogService.getLogStats();
  return result;
};

export const flushLogsAction = async () => {
  const result = await newLogService.flushLogs();
  revalidatePath("/log/user-partition");
  return result;
};

export const getHealthCheckAction = async () => {
  const result = await newLogService.getHealthCheck();
  return result;
};

export const exportPartitionLogsByDateRangeAction = async (
  startDate: string,
  endDate: string
) => {
  return await newLogService.exportPartitionLogsByDateRange(startDate, endDate);
};

// 유저별 파티션 로그 조회 액션 추가
export const getUserPartitionLogsAction = async (
  userId: number,
  page: number = 1,
  filters: {
    type?: string;
    level?: string;
    message?: string;
    startDate?: string;
    endDate?: string;
    metadata?: string;
  } = {}
) => {
  const result = await newLogService.getPartitionLogs({
    ...filters,
    userId,
    page,
    limit: 50,
  });
  return result;
};
