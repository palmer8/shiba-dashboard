"use server";

import { boardService } from "@/service/board-service";
import { realtimeService } from "@/service/realtime-service";
import { unstable_cache } from "next/cache";
import { ApiResponse } from "@/types/global.dto";
import { DashboardData, BoardsData } from "@/types/dashboard";

const getCachedUserCount = unstable_cache(
  async () => realtimeService.getRealtimeUser(),
  ["realtime-user-count"],
  { revalidate: 30 }
);

const getCachedAdminData = unstable_cache(
  async () => realtimeService.getAdminData(),
  ["realtime-admin-data"],
  { revalidate: 30 }
);

const getCachedWeeklyStats = unstable_cache(
  async () => {
    return realtimeService.getWeeklyNewUsersStats();
  },
  ["weekly-stats"],
  {
    revalidate: 3600,
    tags: ["weekly-stats"],
  }
);

export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  try {
    const weeklyStatsRes = await getCachedWeeklyStats();
    const [userCountRes, adminDataRes, recentBoardsRes] = await Promise.all([
      getCachedUserCount(),
      getCachedAdminData(),
      boardService.getRecentBoards(),
    ]);

    const dashboardData: Partial<DashboardData> = {};

    if (userCountRes.success && userCountRes.data !== null) {
      dashboardData.userCount = userCountRes.data;
    }

    if (adminDataRes.success && adminDataRes.data !== null) {
      dashboardData.adminData = adminDataRes.data;
    }

    if (weeklyStatsRes.success && weeklyStatsRes.data !== null) {
      dashboardData.weeklyStats = weeklyStatsRes.data;
    } else {
      dashboardData.weeklyStats = [];
    }

    if (recentBoardsRes.success && recentBoardsRes.data !== null) {
      dashboardData.recentBoards = recentBoardsRes.data;
    }

    return {
      success: true,
      data: dashboardData as DashboardData,
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
