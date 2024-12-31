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
import { redirect } from "next/navigation";
import { AdminAttendance, WorkHours } from "@/types/attendance";
import { format } from "date-fns";

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

  async getAttendanceAll(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AdminAttendance[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");
    if (!hasAccess(session.user.role, UserRole.MASTER)) return redirect("/404");
    if (!session.user.isPermissive) return redirect("/pending");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = startDate ? new Date(startDate) : today;
    const end = endDate ? new Date(endDate) : today;
    end.setHours(23, 59, 59, 999);

    try {
      const attendances = await prisma.attendance.findMany({
        include: {
          checkIns: {
            where: {
              timestamp: {
                gte: start,
                lte: end,
              },
            },
            orderBy: { timestamp: "asc" },
          },
          checkOuts: {
            where: {
              timestamp: {
                gte: start,
                lte: end,
              },
            },
            orderBy: { timestamp: "asc" },
          },
        },
      });

      const formattedData: AdminAttendance[] = attendances.map((attendance) => {
        const dateMap = new Map<string, { in: string; out: string | null }>();
        const workHoursMap = new Map<string, WorkHours[]>();
        const weeklyStats: any[] = [];

        attendance.checkIns.forEach((checkIn) => {
          const date = format(checkIn.timestamp, "yyyy-MM-dd");
          dateMap.set(date, {
            in: checkIn.timestamp.toISOString(),
            out: null,
          });

          workHoursMap.set(date, [
            {
              startTime: format(checkIn.timestamp, "HH:mm"),
              endTime: null,
            },
          ]);
        });

        attendance.checkOuts.forEach((checkOut) => {
          const date = format(checkOut.timestamp, "yyyy-MM-dd");
          if (dateMap.has(date)) {
            dateMap.get(date)!.out = checkOut.timestamp.toISOString();
            workHoursMap.get(date)![0].endTime = format(
              checkOut.timestamp,
              "HH:mm"
            );
          }
        });

        const records = Array.from(dateMap.entries());
        records.forEach(([date, record]) => {
          if (record.out) {
            const inTime = new Date(record.in);
            const outTime = new Date(record.out);
            const hours =
              (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);

            weeklyStats.push({
              date: format(inTime, "MM/dd"),
              hours,
              expected: 8,
            });
          }
        });

        return {
          userId: attendance.userId,
          nickname: attendance.nickname,
          records: Array.from(dateMap.entries()).map(([date, record]) => ({
            date,
            in: record.in,
            out: record.out,
          })),
          today: {
            in:
              attendance.checkIns
                .find(
                  (check) =>
                    format(check.timestamp, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd")
                )
                ?.timestamp.toISOString() || null,
            out:
              attendance.checkOuts
                .find(
                  (check) =>
                    format(check.timestamp, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd")
                )
                ?.timestamp.toISOString() || null,
          },
          workHours: Object.fromEntries(workHoursMap),
          weeklyStats: weeklyStats,
        };
      });

      return {
        success: true,
        data: formattedData,
        error: null,
      };
    } catch (error) {
      console.error("근태 조회 에러:", error);
      return {
        success: false,
        error: "근태 목록을 조회하는데 실패했습니다",
        data: null,
      };
    }
  }
}

export const adminService = new AdminService();
