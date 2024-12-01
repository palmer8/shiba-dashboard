import prisma from "@/db/prisma";
import {
  RemoveUserVehicleDto,
  RemoveUserWeaponDto,
  UpdateUserDataDto,
  UpdateUserGroupDto,
} from "@/dto/realtime.dto";
import { auth } from "@/lib/auth-config";
import { GlobalReturn } from "@/types/global-return";
import { UpdateUserData } from "@/types/user";
import { userService } from "./user-service";
import { UserRole } from "@prisma/client";
import { hasAccess, ROLE_HIERARCHY } from "@/lib/utils";

class RealtimeUpdateService {
  async updateUserInventory(
    data: UpdateUserData
  ): Promise<GlobalReturn<UpdateUserDataDto>> {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        data: null,
        success: false,
        message: "세션 정보가 없습니다",
        error: null,
      };
    }

    const user = await userService.getUserById(session.user.id);

    if (!user.data) {
      return {
        data: null,
        success: false,
        message: "유저 정보를 찾을 수 없습니다",
        error: null,
      };
    }

    if (!hasAccess(user.data.role, UserRole.INGAME_ADMIN)) {
      return {
        data: null,
        success: false,
        message: "권한이 없습니다",
        error: null,
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
        message: "유저 아이템 업데이트 성공",
        error: null,
      };
    } else {
      return {
        data: null,
        success: false,
        message: "유저 아이템 업데이트 실패",
        error: null,
      };
    }
  }

  async removeUserWeapon(data: RemoveUserWeaponDto) {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        data: null,
        success: false,
        message: "세션 정보가 없습니다",
        error: null,
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

  async removeUserVehicle(data: RemoveUserVehicleDto) {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        data: null,
        success: false,
        message: "세션 정보가 없습니다",
        error: null,
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

  async updateUserGroup(data: UpdateUserGroupDto) {
    const session = await auth();

    if (!session?.user?.id || !session.user.role) {
      return {
        data: null,
        success: false,
        message: "세션 정보가 없습니다",
        error: null,
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
        message: "유저 정보를 찾을 수 없습니다",
        error: null,
      };
    }

    // 그룹 정보 조회
    const group = await prisma.groups.findUnique({
      where: { groupId: data.group },
      select: { minRole: true },
    });

    if (!group) {
      return {
        data: null,
        success: false,
        message: "존재하지 않는 그룹입니다",
        error: null,
      };
    }

    // 권한 체크
    if (!hasAccess(user.role, group.minRole)) {
      return {
        data: null,
        success: false,
        message: "해당 그룹을 수정할 권한이 없습니다",
        error: null,
      };
    }

    const response = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/updateplayerGroup`,
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
          content: `${data.user_id}의 그룹 ${data.action}: ${data.group}`,
          registrantId: session.user.id,
        },
      }),
    ]);

    return result;
  }
}

export const realtimeUpdateService = new RealtimeUpdateService();
