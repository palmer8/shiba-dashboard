"use server";

import { logService } from "@/service/log-service";

export const exportGameLogsAction = async (ids: number[]) => {
  const result = await logService.exportGameLogs(ids);
  return result;
};

export async function getAccountUsingLogsByIdsAction(ids: string[]) {
  const result = await logService.getAccountUsingLogs(ids);
  return result;
}
