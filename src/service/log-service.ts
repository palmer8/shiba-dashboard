import { prisma } from "@/db/prisma";
import pool from "@/db/mysql";
import db from "@/db/pg";
import {
  AdminLogFilters,
  AdminLogListResponse,
  GameLogFilters,
  GameLogResponse,
  StaffLog,
  StaffLogFilter,
  StaffLogResponse,
} from "@/types/log";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { ApiResponse } from "@/types/global.dto";
import { RowDataPacket } from "mysql2";

export class LogService {
  async getAdminLogs(
    filters: AdminLogFilters
  ): Promise<ApiResponse<AdminLogListResponse>> {
    try {
      const pageSize = 50;
      const page = filters.page || 1;
      const skip = (page - 1) * pageSize;

      const where: any = {
        ...(filters.content && {
          content: { contains: filters.content },
        }),
        ...(filters.registrantUserId && {
          registrant: { userId: filters.registrantUserId },
        }),
        ...(filters.date?.length === 2 && {
          createdAt: {
            gte: filters.date[0],
            lte: filters.date[1],
          },
        }),
      };

      const [records, total] = await prisma.$transaction([
        prisma.accountUsingQuerylog.findMany({
          where,
          include: {
            registrant: {
              select: {
                userId: true,
                nickname: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.accountUsingQuerylog.count({ where }),
      ]);

      return {
        success: true,
        data: {
          records: records.map(({ registrant, ...record }) => ({
            id: record.id,
            content: record.content,
            registrantId: record.registrantId,
            registrantUserId: registrant?.userId || null,
            registrantNickname: registrant?.nickname || null,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          })),
          total,
          page,
          totalPages: Math.ceil(total / pageSize),
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

      const totalCount = result[0]?.total_count || 0;

      return {
        success: true,
        data: {
          records: result.map(({ total_count, ...row }) => ({
            id: row.id,
            timestamp: row.timestamp,
            level: row.level,
            type: row.type,
            message: row.message,
            metadata: row.metadata,
          })),
          total: totalCount,
          page: filters.page || 1,
          totalPages: Math.ceil(totalCount / limit),
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
    if (!session?.user) {
      return {
        success: false,
        message: "세션이 존재하지 않습니다",
        data: null,
        error: "세션이 존재하지 않습니다",
      };
    }

    try {
      const chunkSize = 1000;
      const chunks = [];

      for (let i = 0; i < ids.length; i += chunkSize) {
        chunks.push(ids.slice(i, i + chunkSize));
      }

      const logs = await Promise.all(
        chunks.map((chunk) => db.queryLogsByIds(chunk))
      );

      return {
        success: true,
        message: "유저 데이터 로드 성공",
        data: logs.flat(),
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
    if (!session?.user) {
      return {
        error: "세션이 존재하지 않습니다.",
        data: null,
        success: false,
      };
    }

    if (!hasAccess(session.user.role, UserRole.MASTER)) {
      return {
        error: "권한이 없습니다.",
        data: null,
        success: false,
      };
    }

    try {
      const chunkSize = 1000;
      const chunks = [];

      for (let i = 0; i < ids.length; i += chunkSize) {
        chunks.push(ids.slice(i, i + chunkSize));
      }

      const results = await Promise.all(
        chunks.map((chunk) =>
          prisma.accountUsingQuerylog.findMany({
            where: { id: { in: chunk } },
          })
        )
      );

      return {
        success: true,
        data: results.flat(),
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

  async getStaffLogs(
    filters: StaffLogFilter
  ): Promise<ApiResponse<StaffLogResponse>> {
    try {
      const pageSize = 50;
      const page = filters.page || 1;
      const offset = (page - 1) * pageSize;

      const query = `
        SELECT 
          staff_id,
          staff_name,
          target_id,
          target_name,
          description,
          time,
          COUNT(*) OVER() as total
        FROM dokku_stafflog
        WHERE 1=1
        ${filters.staffId ? " AND staff_id = ?" : ""}
        ${filters.targetId ? " AND target_id = ?" : ""}
        ${
          filters.startDate && filters.endDate
            ? " AND time BETWEEN ? AND ?"
            : ""
        }
        ORDER BY time DESC
        LIMIT ? OFFSET ?
      `;

      const params = [
        ...(filters.staffId ? [filters.staffId] : []),
        ...(filters.targetId ? [filters.targetId] : []),
        ...(filters.startDate && filters.endDate
          ? [filters.startDate, filters.endDate]
          : []),
        pageSize,
        offset,
      ];

      const [rows] = await pool.execute<RowDataPacket[]>(query, params);
      const total = rows[0]?.total || 0;

      return {
        success: true,
        data: {
          records: rows.map(({ total, ...row }) => row) as StaffLog[],
          total,
          page,
          totalPages: Math.ceil(total / pageSize),
          pageSize,
        },
        error: null,
      };
    } catch (error) {
      console.error("스태프 로그 조회 에러:", error);
      return {
        success: false,
        data: {
          records: [],
          total: 0,
          page: 1,
          totalPages: 1,
          pageSize: 50,
        },
        error: "스태프 로그 조회에 실패했습니다.",
      };
    }
  }
}

export const logService = new LogService();
