import prisma from "@/db/prisma";
import { auth } from "@/lib/auth-config";
import { hasAccess, ROLE_HIERARCHY } from "@/lib/utils";
import { AdminFilter, GroupFilter } from "@/types/filters/admin-filter";
import { Prisma, User, UserRole } from "@prisma/client";
import { AdminDto, GroupTableData } from "@/types/user";
import { ApiResponse } from "@/types/global.dto";
import { redirect } from "next/navigation";
import {
  AttendanceStats,
  ProcessedAdminAttendance,
  ProcessedRecord,
  WorkHours,
} from "@/types/attendance";
import { format } from "date-fns";
import { eachDayOfInterval, isWeekend } from "date-fns";
import { logService } from "./log-service";
import bcrypt from "bcrypt";

class AdminService {
  async getDashboardUsers(params: AdminFilter): Promise<ApiResponse<AdminDto>> {
    // 페이지네이션 제거: 모든 유저를 한 번에 반환
    const accounts = await prisma.user.findMany({
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
    });

    return {
      success: true,
      data: {
        items: accounts,
        page: 1,
        totalPages: 1,
        totalCount: accounts.length,
      },
      error: null,
    };
  }

  async updateDashboardUserRole(
    id: string,
    role: UserRole
  ): Promise<ApiResponse<Pick<User, "id" | "role">>> {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        data: null,
      };
    }

    const [registrant, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, id: true, userId: true },
      }),
      prisma.user.findUnique({
        where: { id },
        select: { role: true, userId: true },
      }),
    ]);

    if (!registrant || !targetUser) {
      return {
        success: false,
        error: "유저를 찾을 수 없습니다.",
        data: null,
      };
    }

    // SUPERMASTER 간의 권한 관리 규칙
    if (targetUser.role === UserRole.SUPERMASTER) {
      // userId가 1인 SUPERMASTER만 다른 SUPERMASTER 수정 가능
      if (registrant.userId !== 1) {
        return {
          success: false,
          error: "다른 슈퍼마스터의 권한을 수정할 수 없습니다.",
          data: null,
        };
      }
    }

    // 나머지 권한 체크 로직
    if (
      registrant.role !== UserRole.SUPERMASTER &&
      ROLE_HIERARCHY[targetUser.role] >= ROLE_HIERARCHY[registrant.role]
    ) {
      return {
        success: false,
        error:
          "본인과 동일하거나 상위 권한을 가진 사용자의 권한을 수정할 수 없습니다.",
        data: null,
      };
    }

    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          role: true,
          nickname: true,
          userId: true,
        },
      });

      await tx.accountUsingQuerylog.create({
        data: {
          content: `${updatedUser.nickname}(${updatedUser.userId}) 권한 변경: ${role}`,
          registrantId: session.user!.id,
        },
      });
      return updatedUser;
    });

    return {
      success: true,
      data: user,
      error: null,
    };
  }

  async removeDashboardUser(id: string): Promise<ApiResponse<User>> {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        data: null,
      };
    }

    const [registrant, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, id: true, userId: true },
      }),
      prisma.user.findUnique({
        where: { id },
        select: { role: true, userId: true },
      }),
    ]);

    if (!registrant || !targetUser) {
      return {
        success: false,
        error: "유저를 찾을 수 없습니다.",
        data: null,
      };
    }

    // SUPERMASTER 간의 권한 관리 규칙
    if (targetUser.role === UserRole.SUPERMASTER) {
      if (registrant.userId !== 1) {
        return {
          success: false,
          error: "다른 슈퍼마스터를 삭제할 수 없습니다.",
          data: null,
        };
      }
    }

    const user = await prisma.$transaction(async (tx) => {
      const deletedUser = await tx.user.delete({
        where: { id },
      });

      await tx.accountUsingQuerylog.create({
        data: {
          content: `${deletedUser.nickname}(${deletedUser.id}) 어드민 제거`,
          registrantId: session.user!.id,
        },
      });
      return deletedUser;
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

    if (!session?.user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        data: null,
      };
    }

    const [registrant, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, id: true, userId: true },
      }),
      prisma.user.findUnique({
        where: { id },
        select: { role: true, userId: true },
      }),
    ]);

    if (!registrant || !targetUser) {
      return {
        success: false,
        error: "유저를 찾을 수 없습니다.",
        data: null,
      };
    }

    // SUPERMASTER 간의 권한 관리 규칙
    if (targetUser.role === UserRole.SUPERMASTER) {
      if (registrant.userId !== 1) {
        return {
          success: false,
          error: "다른 슈퍼마스터의 상태를 수정할 수 없습니다.",
          data: null,
        };
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { isPermissive: value },
      });

      await tx.accountUsingQuerylog.create({
        data: {
          content: `${updatedUser.nickname}(${updatedUser.id}) 어드민 활성화 변경: ${value}`,
          registrantId: session.user!.id,
        },
      });
      return updatedUser;
    });

    await logService.writeAdminLog(
      `${result.nickname}(${result.userId}) 어드민 활성화 변경: ${value}`
    );

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

        await logService.writeAdminLog(
          `그룹 권한 수정 - [${updateResult.groupId}] 최소 권한: ${minRole}`
        );

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

  // 평균 시간 계산 헬퍼 메서드
  private calculateAverageTime(times: (string | null)[]): string {
    const validTimes = times.filter(Boolean) as string[];
    if (validTimes.length === 0) return "--:--";

    const totalMinutes = validTimes.reduce((acc, time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return acc + hours * 60 + minutes;
    }, 0);

    const averageMinutes = Math.round(totalMinutes / validTimes.length);
    const hours = Math.floor(averageMinutes / 60);
    const minutes = averageMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  }

  private calculateWorkHours(
    inTime: Date | null,
    outTime: Date | null
  ): string {
    if (!inTime || !outTime) return "-";

    // 시간 차이 계산
    let hours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);

    // 음수 시간이 나오면 24시간 더하기 (익일 퇴근)
    if (hours < 0) {
      hours += 24;
    }

    // 비정상적인 값 체크 (24시간 초과)
    if (hours > 24) {
      return "-";
    }

    return `${hours.toFixed(1)}시간`;
  }

  async resetUserPassword(
    targetUserId: number,
    newPassword: string
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();

    if (!session?.user || !session?.user.id) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        data: null,
      };
    }

    // 요청자가 userId가 1인 SUPERMASTER인지 확인
    const registrant = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, userId: true },
    });

    if (
      !registrant ||
      registrant.userId !== 1 ||
      registrant.role !== "SUPERMASTER"
    ) {
      return {
        success: false,
        error: "권한이 없습니다.",
        data: null,
      };
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { userId: targetUserId },
          data: { hashedPassword },
        });

        await tx.accountUsingQuerylog.create({
          data: {
            content: `${targetUserId}의 비밀번호 재설정`,
            registrantId: session.user!.id as string,
          },
        });
      });

      return {
        success: true,
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("비밀번호 재설정 중 오류:", error);
      return {
        success: false,
        error: "비밀번호 재설정에 실패했습니다.",
        data: null,
      };
    }
  }
}

export const adminService = new AdminService();
