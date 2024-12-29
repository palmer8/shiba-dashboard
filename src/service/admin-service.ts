import prisma from "@/db/prisma";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import {
  AdminFilter,
  AdminGroupFilter,
  GroupFilter,
} from "@/types/filters/admin-filter";
import { Prisma, User, UserRole } from "@prisma/client";
import { AdminDto, GroupTableData } from "@/types/user";
import { ApiResponse } from "@/types/global.dto";
import { Group } from "next/dist/shared/lib/router/utils/route-regex";
import { redirect } from "next/navigation";

class AdminService {
  async getDashboardUsers(params: AdminFilter): Promise<ApiResponse<AdminDto>> {
    const page = params.page || 1;
    const take = 20;

    const [accounts, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * take,
        take,
        where: {
          ...(params.nickname && {
            nickname: {
              contains: params.nickname,
            },
          }),
          ...(params.userId && {
            userId: Number(params.userId),
          }),
          ...(params.role && {
            role: params.role as UserRole,
          }),
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({
        where: {
          ...(params.nickname && {
            nickname: {
              contains: params.nickname,
            },
          }),
          ...(params.userId && {
            userId: {
              equals: Number(params.userId),
            },
          }),
          ...(params.role && {
            role: {
              equals: params.role as UserRole,
            },
          }),
        },
      }),
    ]);

    return {
      success: true,
      data: {
        items: accounts,
        page,
        totalPages: Math.ceil(total / take),
        totalCount: total,
      },
      error: null,
    };
  }

  async updateDashboardUserRole(
    id: string,
    role: UserRole
  ): Promise<ApiResponse<Pick<User, "id" | "role">>> {
    const session = await auth();

    if (!session) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        data: null,
      };
    }

    const registrant = await prisma.user.findUnique({
      where: { id: session.user?.id },
      select: {
        role: true,
        id: true,
      },
    });

    if (!registrant) {
      return {
        success: false,
        error: "유저를 찾을 수 없습니다.",
        data: null,
      };
    }

    if (!hasAccess(registrant.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        error: "권한이 없습니다.",
        data: null,
      };
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        role: true,
      },
    });

    return {
      success: true,
      data: user,
      error: null,
    };
  }

  async removeDashboardUser(id: string): Promise<ApiResponse<User>> {
    const session = await auth();

    if (!session) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        data: null,
      };
    }

    const registrant = await prisma.user.findUnique({
      where: { id: session.user?.id },
      select: {
        role: true,
        id: true,
      },
    });

    if (!registrant || !hasAccess(registrant.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        error: "권한이 없습니다.",
        data: null,
      };
    }

    const user = await prisma.user.delete({
      where: { id },
    });
    return {
      success: true,
      data: user,
      error: null,
    };
  }

  async toggleDashboardUserPermission(
    id: string,
    value: boolean
  ): Promise<ApiResponse<User>> {
    const session = await auth();

    if (!session) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        data: null,
      };
    }

    const registrant = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: {
        role: true,
        id: true,
      },
    });

    if (!registrant || !hasAccess(registrant.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        error: "권한이 없습니다.",
        data: null,
      };
    }

    const result = await prisma.user.update({
      where: { id },
      data: { isPermissive: value },
    });

    return {
      success: true,
      data: result,
      error: null,
    };
  }

  async getGroups(
    page: number,
    filter: GroupFilter
  ): Promise<ApiResponse<GroupTableData>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const where: Prisma.GroupsWhereInput = {};

      if (filter.name) {
        where.groupId = {
          contains: filter.name,
        };
      }

      if (filter.role) {
        where.minRole = filter.role as UserRole;
      }

      const [records, total] = await Promise.all([
        prisma.groups.findMany({
          where,
          skip: ((page || 1) - 1) * 50,
          take: 50,
          orderBy: { groupId: "asc" },
        }),
        prisma.groups.count({ where }),
      ]);

      return {
        success: true,
        data: {
          records: records,
          metadata: {
            total,
            page: page || 1,
            totalPages: Math.ceil(total / 50),
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get groups error:", error);
      return {
        success: false,
        error: "그룹 목록 조회 실패",
        data: null,
      };
    }
  }

  async updateGroup(
    groupId: string,
    minRole: UserRole
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        error: "권한이 없습니다.",
        data: null,
      };
    }

    try {
      const result = await prisma.$transaction(async (prisma) => {
        const updateResult = await prisma.groups.update({
          where: { groupId },
          data: {
            minRole,
          },
        });

        const logResult = await prisma.accountUsingQuerylog.create({
          data: {
            content: `그룹 권한 수정 - [${updateResult.groupId}] minRole: ${minRole}`,
            registrantId: session.user!.id,
          },
        });

        return { updateResult, logResult };
      });

      return {
        success: true,
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Update group error:", error);
      return {
        success: false,
        error: "그룹 정보 수정 실패",
        data: null,
      };
    }
  }
}

export const adminService = new AdminService();
