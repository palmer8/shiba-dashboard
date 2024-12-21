import prisma from "@/db/prisma";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { AdminFilter } from "@/types/filters/admin-filter";
import { User, UserRole } from "@prisma/client";
import { AdminDto } from "@/types/user";
import { ApiResponse } from "@/types/global.dto";

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
}

export const adminService = new AdminService();
