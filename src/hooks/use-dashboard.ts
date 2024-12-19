import useSWR from "swr";
import { DashboardData } from "@/types/dashboard";
import { getDashboardData } from "@/actions/realtime/realtime-dashboard-action";

const CACHE_KEY = "dashboard";
const REFRESH_INTERVAL = 180000; // 3분

export function useDashboard() {
  return useSWR<DashboardData, Error>(
    CACHE_KEY,
    async () => {
      const response = await getDashboardData();
      if (!response.success || !response.data) {
        throw new Error(response.error || "데이터를 불러오는데 실패했습니다.");
      }
      return response.data;
    },
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      fallbackData: {
        userCount: 0,
        adminData: { count: 0, users: [] },
        weeklyStats: [],
        recentBoards: { recentBoards: [], recentNotices: [] },
      },
      onError: (error) => {
        console.error("Dashboard fetch error:", error);
      },
    }
  );
}
