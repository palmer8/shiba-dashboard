import { auth } from "@/lib/auth-config";
import { GlobalReturn } from "@/types/global-return";
import { boardService } from "./board-service";
import prisma from "@/db/prisma";
import { ROLE_HIERARCHY } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { userService } from "./user-service";

class RealtimeService {
  private async getRealtimeUser(): Promise<GlobalReturn<number>> {
    try {
      const realtimeUserCountResponse = await fetch(
        `${process.env.PRIVATE_API_URL}/DokkuApi/getPlayersCount`,
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
            key: process.env.PRIVATE_API_KEY || "",
          },
        }
      );

      if (!realtimeUserCountResponse.ok) {
        throw new Error(
          `HTTP error! status: ${realtimeUserCountResponse.status}`
        );
      }

      const realtimeUserCountData = await realtimeUserCountResponse.json();

      return {
        success: true,
        message: "실시간 유저 수 조회 성공",
        data: realtimeUserCountData.playerNum || 0,
        error: null,
      };
    } catch (error) {
      console.error("Realtime user count error:", error);
      return {
        success: false,
        message: "실시간 유저 수 조회 실패",
        data: 0,
        error,
      };
    }
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

  async getGroupDataByGroupName(groupName: string, cursor?: number) {
    const groupDataResponse = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/getPlayersGroupFind`,
      {
        method: "POST",
        body: JSON.stringify({ groupWord: groupName, cursor: cursor || 0 }),
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
      }
    );

    const groupData = await groupDataResponse.json();

    return {
      success: true,
      message: "그룹 데이터 조회 성공",
      data: groupData,
      error: null,
    };
  }

  async getUserGroups(userId: number) {
    const session = await auth();

    if (!session) {
      return {
        success: false,
        message: "세션 정보가 없습니다",
        data: null,
        error: null,
      };
    }

    const getUserGroupsResponse = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/getplayerGroup`,
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
      }
    );

    const userGroups = await getUserGroupsResponse.json();

    return {
      success: true,
      message: "유저 그룹 조회 성공",
      data: userGroups,
      error: null,
    };
  }

  async getAdminData() {
    const adminDataResponse = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/getAdmin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
      }
    );

    const adminData = await adminDataResponse.json();

    return {
      success: true,
      message: "관리자 데이터 조회 성공",
      data: adminData,
      error: null,
    };
  }

  async getAllDashboardData() {
    try {
      const [userCount, adminData, recentBoards] = await Promise.all([
        this.getRealtimeUser(),
        this.getAdminData(),
        boardService.getRecentBoards(),
      ]);

      return {
        success: true,
        message: "대시보드 데이터 조회 성공",
        data: {
          userCount: userCount.data || 0,
          adminData: adminData.data || { count: 0, users: [] },
          recentBoards: recentBoards.data || {
            recentBoards: [],
            recentNotices: [],
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Dashboard data error:", error);
      return {
        success: false,
        message: "대시보드 데이터 조회 실패",
        data: {
          userCount: 0,
          adminData: { count: 0, users: [] },
          recentBoards: { recentBoards: [], recentNotices: [] },
        },
        error,
      };
    }
  }

  async getGroupsByGroupId(groupId: string) {
    const session = await auth();

    if (!session?.user?.role) {
      return {
        success: false,
        message: "권한이 없습니다.",
        data: [],
        error: "Unauthorized",
      };
    }

    const userRole = session.user.role as UserRole;

    const groups = await prisma.groups.findMany({
      select: {
        groupId: true,
        groupBoolean: true,
      },
      where: {
        AND: [
          {
            groupId: {
              contains: groupId,
              mode: "insensitive",
            },
          },
          {
            minRole: {
              in: Object.keys(ROLE_HIERARCHY).filter(
                (role) =>
                  ROLE_HIERARCHY[role as UserRole] <= ROLE_HIERARCHY[userRole]
              ) as UserRole[],
            },
          },
        ],
      },
      orderBy: {
        groupId: "asc",
      },
      take: 5,
    });

    return {
      success: true,
      message: "그룹 조회 성공",
      data: groups,
      error: null,
    };
  }

  async getItemsByItemName(itemName: string) {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: "권한이 없습니다.",
        data: [],
        error: "Unauthorized",
      };
    }

    const items = await prisma.items.findMany({
      select: {
        itemId: true,
        itemName: true,
      },
      where: {
        itemName: {
          contains: itemName,
          mode: "insensitive",
        },
      },
      orderBy: { itemName: "asc" },
      take: 5,
    });

    return {
      success: true,
      message: "아이템 조회 성공",
      data: items,
      error: null,
    };
  }
}

export const realtimeService = new RealtimeService();
