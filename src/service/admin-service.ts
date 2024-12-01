import prisma from "@/db/prisma";
import { AdminDto } from "@/dto/admin.dto";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { AdminFilter } from "@/types/filters/admin-filter";
import { GlobalReturn } from "@/types/global-return";
import { User, UserRole } from "@prisma/client";

class AdminService {
  async getDashboardUsers(
    params: AdminFilter
  ): Promise<GlobalReturn<AdminDto>> {
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
        select: {
          id: true,
          name: true,
          nickname: true,
          role: true,
          userId: true,
          isPermissive: true,
          createdAt: true,
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
      message: "어드민 유저 조회 성공",
      data: {
        items: accounts,
        total,
        page,
        totalPages: Math.ceil(total / take),
      },
      error: null,
    };
  }

  async updateDashboardUserRole(
    id: string,
    role: UserRole
  ): Promise<GlobalReturn<Pick<User, "id" | "role">>> {
    const session = await auth();

    if (!session) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
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
        message: "유저를 찾을 수 없습니다.",
        data: null,
        error: null,
      };
    }

    if (!hasAccess(registrant.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        message: "권한이 없습니다.",
        data: null,
        error: null,
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
      message: "유저 권한 수정 성공",
      data: user,
      error: null,
    };
  }

  async removeDashboardUser(id: string): Promise<GlobalReturn<User>> {
    const session = await auth();

    if (!session) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
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
        message: "권한이 없습니다.",
        data: null,
        error: null,
      };
    }

    const user = await prisma.user.delete({
      where: { id },
    });
    return {
      success: true,
      message: "유저 삭제 성공",
      data: user,
      error: null,
    };
  }

  async toggleDashboardUserPermission(
    id: string,
    value: boolean
  ): Promise<GlobalReturn<User>> {
    const session = await auth();

    if (!session) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
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
        message: "권한이 없습니다.",
        data: null,
        error: null,
      };
    }

    const result = await prisma.user.update({
      where: { id },
      data: { isPermissive: value },
    });

    return {
      success: true,
      message: "유저 권한 수정 성공",
      data: result,
      error: null,
    };
  }
}

export const adminService = new AdminService();
