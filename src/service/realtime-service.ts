import { GlobalReturn } from "@/types/global-return";

class RealtimeService {
  private async getRealtimeUser(): Promise<GlobalReturn<number>> {
    const realtimeUserCountResponse = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/getPlayersCount`,
      {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
      }
    );

    const realtimeUserCountData = await realtimeUserCountResponse.json();

    return {
      success: true,
      message: "실시간 유저 수 조회 성공",
      data: realtimeUserCountData.playerNum,
      error: null,
    };
  }

  async getDashboardData() {}

  async getGameUserDataByUserId(userId: number) {
    const userDataResponse = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/getPlayerData`,
      {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({ user_id: userId }),
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
      }
    );

    const userData = await userDataResponse.json();

    if (userData.error) {
      return {
        success: false,
        message: "유저 데이터 조회 실패",
        data: null,
        error: userData.error,
      };
    }

    return {
      success: true,
      message: "유저 데이터 조회 성공",
      data: userData,
      error: null,
    };
  }
}

export const realtimeService = new RealtimeService();
