import prisma from "@/db/prisma";
import { auth } from "@/lib/auth-config";
import { UpdateUserData } from "@/types/user";
import { userService } from "./user-service";
import { UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";
import { ApiResponse } from "@/types/global.dto";
import {
  RemoveUserVehicleDto,
  RemoveUserWeaponDto,
  UpdateUserGroupDto,
} from "@/types/realtime";

class RealtimeUpdateService {
  async updateUserInventory(
    data: UpdateUserData
  ): Promise<ApiResponse<UpdateUserData>> {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        data: null,
        success: false,
        error: "세션 정보가 없습니다",
      };
    }

    const user = await userService.getUserById(session.user.id);

    if (!user.data) {
      return {
        data: null,
        success: false,
        error: "유저 정보를 찾을 수 없습니다",
      };
    }

    if (!hasAccess(user.data.role, UserRole.INGAME_ADMIN)) {
      return {
        data: null,
        success: false,
        error: "권한이 없습니다",
      };
    }

    const response = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/updatePlayerItem`,
      {
        method: "POST",
        headers: {
          key: process.env.PRIVATE_API_KEY || "",
        },
        body: JSON.stringify(data),
      }
    );

    const [result, _] = await Promise.all([
      response.json(),
      prisma.accountUsingQuerylog.create({
        data: {
          content: `${data.user_id}의 인벤토리 ${data.type} :  ${data.itemcode}, (${data.amount}개)`,
          registrantId: session.user.id,
        },
      }),
    ]);

    if (result.success) {
      return {
        data: result,
        success: true,
        error: null,
      };
    } else {
      return {
        data: null,
        success: false,
        error: "유저 아이템 업데이트 실패",
      };
    }
  }

  async removeUserWeapon(
    data: RemoveUserWeaponDto
  ): Promise<ApiResponse<RemoveUserWeaponDto>> {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        data: null,
        success: false,
        error: "세션 정보가 없습니다",
      };
    }

    const response = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/removePlayerWeapon`,
      {
        method: "POST",
        headers: {
          key: process.env.PRIVATE_API_KEY || "",
        },
        body: JSON.stringify(data),
      }
    );

    const [result, _] = await Promise.all([
      response.json(),
      prisma.accountUsingQuerylog.create({
        data: {
          content: `${data.user_id}의 무기 제거: ${data.weapon}`,
          registrantId: session.user.id,
        },
      }),
    ]);

    return result;
  }

  async removeUserVehicle(
    data: RemoveUserVehicleDto
  ): Promise<ApiResponse<RemoveUserVehicleDto>> {
    const session = await auth();

    if (!session || !session.user) {
      return {
        data: null,
        success: false,
        error: "세션 정보가 없습니다",
      };
    }

    const response = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/removePlayerVehicle`,
      {
        method: "POST",
        headers: {
          key: process.env.PRIVATE_API_KEY || "",
        },
        body: JSON.stringify(data),
      }
    );

    const [result, _] = await Promise.all([
      response.json(),
      prisma.accountUsingQuerylog.create({
        data: {
          content: `${data.user_id}의 차량 제거: ${data.vehicle}`,
          registrantId: session.user.id,
        },
      }),
    ]);

    return result;
  }

  async updateUserGroup(
    data: UpdateUserGroupDto
  ): Promise<ApiResponse<UpdateUserGroupDto>> {
    const session = await auth();

    if (!session?.user?.id || !session.user.role) {
      return {
        data: null,
        success: false,
        error: "세션 정보가 없습니다",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return {
        data: null,
        success: false,
        error: "유저 정보를 찾을 수 없습니다",
      };
    }

    const group = await prisma.groups.findUnique({
      where: { groupId: data.group },
      select: { minRole: true },
    });

    if (group) {
      if (!hasAccess(user.role, group.minRole)) {
        return {
          data: null,
          success: false,
          error: "해당 그룹을 수정할 권한이 없습니다",
        };
      }
    } else if (!group && data.action !== "remove") {
      return {
        data: null,
        success: false,
        error: "존재하지 않는 그룹입니다",
      };
    }

    const response = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/updateplayerGroup`,
      {
        method: "POST",
        headers: { key: process.env.PRIVATE_API_KEY || "" },
        body: JSON.stringify(data),
      }
    );

    const [result, _] = await Promise.all([
      response.json(),
      prisma.accountUsingQuerylog.create({
        data: {
          content: `${data.user_id}의 그룹 ${data.action}: ${data.group}`,
          registrantId: session.user.id,
        },
      }),
    ]);
    return result;
  }
}

export const realtimeUpdateService = new RealtimeUpdateService();
