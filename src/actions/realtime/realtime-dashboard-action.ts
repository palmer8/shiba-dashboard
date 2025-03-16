"use server";

import { boardService } from "@/service/board-service";
import { realtimeService } from "@/service/realtime-service";
import { cache } from "react";
import { ApiResponse } from "@/types/global.dto";
import { DashboardData } from "@/types/dashboard";

const getCachedUserCount = cache(async () => {
  return realtimeService.getRealtimeUser();
});

const getCachedAdminData = cache(async () => {
  return realtimeService.getAdminData();
});

const getCachedWeeklyStats = cache(async () => {
  return realtimeService.getWeeklyNewUsersStats();
});

export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  try {
    const [userCount, adminData, weeklyStats, onlinePlayers, recentBoards] =
      await Promise.all([
        realtimeService.getRealtimeUser(),
        realtimeService.getAdminData(),
        realtimeService.getWeeklyNewUsersStats(),
        realtimeService.getOnlinePlayers(),
        realtimeService.getRecentBoards(),
      ]);

    return {
      success: true,
      data: {
        userCount: userCount.data || 0,
        adminData: adminData.data || null,
        weeklyStats: weeklyStats.data || null,
        recentBoards: recentBoards.success
          ? recentBoards.data
          : {
              recentNotices: [],
              recentBoards: [],
            },
        onlinePlayers: onlinePlayers.data?.users || [],
      },
      error: null,
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return {
      success: false,
      data: null,
      error: "대시보드 데이터를 가져오는데 실패했습니다.",
    };
  }
}
