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
import {
  AttendanceStats,
  ProcessedAdminAttendance,
  ProcessedRecord,
  WorkHours,
} from "@/types/attendance";
import { format } from "date-fns";
import { eachDayOfInterval, isWeekend } from "date-fns";

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
  ): Promise<ApiResponse<ProcessedAdminAttendance[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");
    if (!hasAccess(session.user.role, UserRole.MASTER)) return redirect("/404");
    if (!session.user.isPermissive) return redirect("/pending");

    try {
      // 날짜 범위 설정 (기본값: 한달)
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate
        ? new Date(startDate)
        : new Date(end.getFullYear(), end.getMonth() - 1, end.getDate());

      end.setHours(23, 59, 59, 999);
      start.setHours(0, 0, 0, 0);

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

      const formattedData: ProcessedAdminAttendance[] = attendances.map(
        (attendance) => {
          const dateMap = new Map<string, ProcessedRecord>();
          const workHoursMap = new Map<string, WorkHours[]>();
          const weeklyStats: AttendanceStats["weeklyStats"] = [];

          // 날짜별 기본 데이터 초기화 (시작일부터 종료일까지)
          const days = eachDayOfInterval({ start, end });
          days.forEach((day) => {
            const date = format(day, "yyyy-MM-dd");
            if (!isWeekend(day)) {
              dateMap.set(date, {
                date,
                in: null,
                out: null,
                displayIn: null,
                displayOut: null,
                isOvernight: false,
                workHours: "-",
              });
            }
          });

          // 출근 기록 처리
          attendance.checkIns.forEach((checkIn) => {
            const date = format(checkIn.timestamp, "yyyy-MM-dd");
            const displayTime = format(checkIn.timestamp, "HH:mm");

            dateMap.set(date, {
              date,
              in: checkIn.timestamp.toISOString(),
              out: null,
              displayIn: displayTime,
              displayOut: null,
              isOvernight: false,
              workHours: "-",
            });

            workHoursMap.set(date, [
              {
                startTime: displayTime,
                endTime: null,
              },
            ]);
          });

          // 퇴근 기록 처리
          attendance.checkOuts.forEach((checkOut) => {
            const date = format(checkOut.timestamp, "yyyy-MM-dd");
            const record = dateMap.get(date);

            if (record) {
              const displayTime = format(checkOut.timestamp, "HH:mm");
              record.out = checkOut.timestamp.toISOString();
              record.displayOut = displayTime;

              // 근무 시간 계산 로직 개선
              if (record.in) {
                const inTime = new Date(record.in);
                const outTime = new Date(record.out);
                const inHour = inTime.getHours() + inTime.getMinutes() / 60;
                const outHour = outTime.getHours() + outTime.getMinutes() / 60;

                // 익일 퇴근 체크
                record.isOvernight = inHour > outHour;

                let hours;
                if (record.isOvernight) {
                  // 익일 퇴근인 경우: 24시간 - 출근시간 + 퇴근시간
                  hours = 24 - inHour + outHour;
                } else {
                  // 당일 퇴근인 경우: 퇴근시간 - 출근시간
                  hours = outHour - inHour;
                }

                // 유효한 근무시간 범위 체크 (0-24시간)
                if (hours >= 0 && hours <= 24) {
                  record.workHours = `${hours.toFixed(1)}시간`;
                } else {
                  record.workHours = "-";
                }

                // 주간 통계에는 유효한 근무시간만 추가
                if (!isWeekend(inTime) && hours >= 0 && hours <= 24) {
                  weeklyStats.push({
                    date: format(inTime, "MM/dd"),
                    hours: Number(hours.toFixed(1)),
                    expected: 8,
                  });
                }
              } else {
                // 출근 기록이 없는 경우
                record.workHours = "-";
              }

              // workHours 맵 업데이트
              const workHourRecord = workHoursMap.get(date);
              if (workHourRecord) {
                workHourRecord[0].endTime = displayTime;
              }
            }
          });

          // 평균 시간 계산
          const validRecords = Array.from(dateMap.values()).filter(
            (r) => !isWeekend(new Date(r.date))
          );
          const averageIn = this.calculateAverageTime(
            validRecords.map((r) => r.displayIn)
          );
          const averageOut = this.calculateAverageTime(
            validRecords.map((r) => r.displayOut)
          );

          return {
            userId: attendance.userId,
            nickname: attendance.nickname,
            records: Array.from(dateMap.values()),
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
            stats: {
              averageTimes: {
                in: averageIn,
                out: averageOut,
              },
              weeklyStats: weeklyStats,
            },
            workHours: Object.fromEntries(workHoursMap),
          };
        }
      );

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
}

export const adminService = new AdminService();
