"use server";

import { realtimeService } from "@/service/realtime-service";

export async function getOnlinePlayersAction() {
  try {
    const response = await realtimeService.getOnlinePlayers();
    return response;
  } catch (error) {
    console.error("Failed to fetch online players:", error);
    return {
      success: false,
      data: null,
      error: "온라인 플레이어 목록을 가져오는데 실패했습니다.",
    };
  }
}
