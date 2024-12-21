import { prisma } from "@/db/prisma";
import db from "@/db/pg";
import {
  AdminLogFilters,
  AdminLogListResponse,
  GameLogFilters,
  GameLogResponse,
} from "@/types/log";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { ApiResponse } from "@/types/global.dto";

export class LogService {
  async getAdminLogs(
    filters: AdminLogFilters
  ): Promise<ApiResponse<AdminLogListResponse>> {
    try {
      const pageSize = 50;
      const page = filters.page || 1;
      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (filters.content) {
        where.content = {
          contains: filters.content,
        };
      }

      if (filters.registrantUserId) {
        where.registrant = {
          userId: filters.registrantUserId,
        };
      }

      if (filters.date && filters.date.length === 2) {
        where.createdAt = {
          gte: filters.date[0],
          lte: filters.date[1],
        };
      }

      const [total, records] = await Promise.all([
        prisma.accountUsingQuerylog.count({ where }),
        prisma.accountUsingQuerylog.findMany({
          where,
          include: {
            registrant: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: pageSize,
        }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        success: true,
        data: {
          records: records.map((record) => ({
            id: record.id,
            content: record.content,
            registrantId: record.registrantId,
            registrantUserId: record.registrant?.userId || null,
            registrantNickname: record.registrant?.nickname || null,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          })),
          total,
          page,
          totalPages,
        },
        error: null,
      };
    } catch (error) {
      console.error("Get admin logs error:", error);
      return {
        success: false,
        data: {
          records: [],
          total: 0,
          page: 1,
          totalPages: 1,
        },
        error: "어드민 로그 조회 실패",
      };
    }
  }

  async getGameLogs(
    filters: GameLogFilters
  ): Promise<ApiResponse<GameLogResponse>> {
    try {
      const limit = filters.limit || 50;
      const offset = ((filters.page || 1) - 1) * limit;

      const result = await db.queryLogs({
        ...filters,
        limit,
        offset,
      });

      const totalCount = parseInt(result[0]?.total_count?.toString() || "0");
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          records: result.map((row: any) => ({
            ...row,
            total_count: undefined,
          })),
          total: totalCount,
          page: filters.page || 1,
          totalPages,
        },
        error: null,
      };
    } catch (error) {
      console.error("게임 로그 조회 실패:", error);
      return {
        success: false,
        error: "게임 로그 조회 실패",
        data: {
          records: [],
          total: 0,
          page: 1,
          totalPages: 1,
        },
      };
    }
  }

  async exportGameLogs(ids: number[]) {
    const session = await auth();
    if (!session || !session.user)
      return {
        success: false,
        message: "세션이 존재하지 않습니다",
        data: null,
        error: "세션이 존재하지 않습니다",
      };
    try {
      const logs = await db.queryLogsByIds(ids);
      return {
        success: true,
        message: "유저 데이터 로드 성공",
        data: logs,
        error: null,
      };
    } catch (error) {
      console.error("Export game logs error:", error);
      return {
        success: false,
        message: "유저 데이터 로드 실패",
        data: null,
        error,
      };
    }
  }

  async getAccountUsingLogs(ids: string[]) {
    const session = await auth();
    if (!session || !session.user)
      return {
        error: "세션이 존재하지 않습니다.",
        data: null,
        success: false,
      };
    if (!hasAccess(session.user.role, UserRole.MASTER))
      return {
        error: "권한이 없습니다.",
        data: null,
        success: false,
      };
    try {
      const result = await prisma.accountUsingQuerylog.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return {
        success: true,
        data: result,
        error: null,
      };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "알 수 없는 에러가 발생하였습니다",
        data: null,
        success: false,
      };
    }
  }
}

export const logService = new LogService();
