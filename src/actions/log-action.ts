"use server";

import { logService } from "@/service/log-service";
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
