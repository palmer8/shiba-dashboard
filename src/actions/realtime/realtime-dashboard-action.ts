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
    const [userCountRes, adminDataRes, weeklyStatsRes, recentBoardsRes] =
      await Promise.all([
        getCachedUserCount(),
        getCachedAdminData(),
        getCachedWeeklyStats(),
        boardService.getRecentBoards(),
      ]);

    if (
      !userCountRes.success ||
      !adminDataRes.success ||
      !weeklyStatsRes.success ||
      !recentBoardsRes.success
    ) {
      throw new Error("일부 데이터를 가져오는데 실패했습니다.");
    }

    const dashboardData: DashboardData = {
      userCount: userCountRes.data ?? 0,
      adminData: adminDataRes.data ?? { count: 0, users: [] },
      weeklyStats: weeklyStatsRes.data ?? [],
      recentBoards: recentBoardsRes.data ?? {
        recentBoards: [],
        recentNotices: [],
      },
    };

    return {
      success: true,
      data: dashboardData,
      error: null,
    };
  } catch (error) {
    console.error("Dashboard data error:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
