import { prisma } from "@/db/prisma";
import { AdminLogFilters, AdminLogListResponse } from "@/types/log";
import { GlobalReturn } from "@/types/global-return";

export class LogService {
  async getAdminLogs(
    filters: AdminLogFilters
  ): Promise<GlobalReturn<AdminLogListResponse>> {
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
        message: "어드민 로그 조회 성공",
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
        message: "어드민 로그 조회 실패",
        data: {
          records: [],
          total: 0,
          page: 1,
          totalPages: 1,
        },
        error,
      };
    }
  }
}

export const logService = new LogService();
