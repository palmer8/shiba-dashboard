"use server";

import { realtimeService } from "@/service/realtime-service";

export async function returnPlayerSkinAction(userId: number) {
  const result = await realtimeService.returnPlayerSkin(userId);
  return result;
}
