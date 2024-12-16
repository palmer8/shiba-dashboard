"use server";

import { logService } from "@/service/log-service";

export const exportGameLogsAction = async (ids: number[]) => {
  const result = await logService.exportGameLogs(ids);
  return result;
};
