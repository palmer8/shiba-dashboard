import { prisma } from "@/db/prisma";
import pool from "@/db/mysql";
import db from "@/db/pg";
import {
  AdminLogFilters,
  AdminLogListResponse,
  GameLogFilters,
  GameLogResponse,
  RecipeLog,
  RecipeLogFilter,
  RecipeLogResponse,
  StaffLog,
  StaffLogFilter,
  StaffLogResponse,
} from "@/types/log";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { ApiResponse } from "@/types/global.dto";
import { RowDataPacket } from "mysql2";
import { sql } from "drizzle-orm";

interface GameLog {
  type: string;
  level: string;
  message: string;
  metadata: Record<string, any>;
  timestamp?: Date;
}

interface LogFilter {
  type?: string;
  level?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

interface LogQueryResult {
  records: GameLog[];
  total: number;
  page: number;
  totalPages: number;
}

interface DateRange {
  start: string;
  end: string;
}

export class LogMemoryStore {
  private static instance: LogMemoryStore;
  private buffer: GameLog[] = [];
  private _isProcessing: boolean = false;
  private readonly BATCH_SIZE = 1000;
  private readonly FLUSH_INTERVAL = 5000;
  private flushTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startFlushTimer();
  }

  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      void this.processBuffer();
    }, this.FLUSH_INTERVAL);
  }

  public static getInstance(): LogMemoryStore {
    if (!LogMemoryStore.instance) {
      LogMemoryStore.instance = new LogMemoryStore();
    }
    return LogMemoryStore.instance;
  }

  public async addLog(log: GameLog): Promise<void> {
    this.buffer.push({
      ...log,
      timestamp: new Date(),
    });

    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.processBuffer();
    }
  }

  private async processBuffer(): Promise<void> {
    if (this._isProcessing || this.buffer.length === 0) return;

    let logsToProcess: GameLog[] = [];
    try {
      this._isProcessing = true;
      logsToProcess = this.buffer.splice(0, this.BATCH_SIZE);
      await db.batchInsert(logsToProcess);
    } catch (error) {
      console.error("버퍼 처리 실패:", error);
      // 실패한 로그들을 다시 버퍼에 넣기
      this.buffer.unshift(...logsToProcess);
    } finally {
      this._isProcessing = false;
    }
  }

  public async forceFlush(): Promise<void> {
    await this.processBuffer();
  }

  public getStoredLogs(filters: LogFilter = {}): LogQueryResult {
    let filteredLogs = [...this.buffer];

    if (filters.type) {
      filteredLogs = filteredLogs.filter((log) => log.type === filters.type);
    }
    if (filters.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === filters.level);
    }
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp!) >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp!) <= new Date(filters.endDate!)
      );
    }

    const total = filteredLogs.length;
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      records: filteredLogs.slice(start, end),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  public getBufferSize(): number {
    return this.buffer.length;
  }

  public isProcessing(): boolean {
    return this._isProcessing;
  }

  public async clearBuffer(): Promise<void> {
    this.buffer = [];
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

export const logMemoryStore = LogMemoryStore.getInstance();

export class LogService {
  private getDateRange(dateStr: string): DateRange {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return {
      start: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0
      ).toISOString(),
      end: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
      ).toISOString(),
    };
  }

  private getDateWithoutTime(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
  }

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
      const page = filters.page || 0;
      const offset = page * limit;

      let conditions: string[] = [];
      let params: any[] = [];
      let paramIndex = 1;

      if (filters.startDate) {
        conditions.push(`timestamp >= $${paramIndex++}`);
        params.push(this.getDateWithoutTime(filters.startDate));
      }
      if (filters.endDate) {
        conditions.push(`timestamp <= $${paramIndex++}`);
        params.push(
          new Date(
            this.getDateWithoutTime(filters.endDate).setHours(23, 59, 59, 999)
          )
        );
      }
      if (filters.type) {
        conditions.push(`type = $${paramIndex++}`);
        params.push(filters.type);
      }
      if (filters.level) {
        conditions.push(`level = $${paramIndex++}`);
        params.push(filters.level);
      }
      if (filters.message) {
        conditions.push(`message ILIKE $${paramIndex++}`);
        params.push(`%${filters.message}%`);
      }
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const countQuery = `SELECT COUNT(*) as total FROM game_logs ${whereClause}`;
      const countParams = [...params];
      const countResult = await db.sql.unsafe(countQuery, countParams);
      const totalCount = Number(countResult[0]?.total) || 0;

      const dataQuery = `
        SELECT 
          id,
          timestamp,
          level,
          type,
          message,
          metadata
        FROM game_logs
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT $${paramIndex++}
        OFFSET $${paramIndex++}
      `;
      const dataParams = [...params, limit, offset];
      const records = await db.sql.unsafe(dataQuery, dataParams);

      await this.writeAdminLog(
        `유저 로그 조회 (${[
          filters.type,
          filters.level,
          filters.startDate,
          filters.endDate,
          filters.message,
        ]
          .filter(Boolean)
          .join(", ")})`
      );

      return {
        success: true,
        data: {
          records: records.map((log: any) => ({
            id: log.id,
            timestamp: log.timestamp,
            level: log.level,
            type: log.type,
            message: log.message,
            metadata: log.metadata,
          })),
          total: totalCount,
          page: page,
          totalPages: Math.ceil(totalCount / limit),
        },
        error: null,
      };
    } catch (error) {
      console.error("유저 로그 조회 실패:", error);
      return {
        success: false,
        error: "유저 로그 조회 실패",
        data: {
          records: [],
          total: 0,
          page: 0,
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

      let params: any[] = [];
      let dateFilter = "";

      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);

        // 시작일 09:00:00 KST (UTC+9)
        startDate.setHours(9, 0, 0, 0);

        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(8, 59, 59, 999);

        dateFilter = " AND time >= ? AND time <= ?";
        params = [
          startDate.toISOString().slice(0, 19).replace("T", " "),
          endDate.toISOString().slice(0, 19).replace("T", " "),
        ];
      }

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
        ${dateFilter}
        ORDER BY time DESC
        LIMIT ? OFFSET ?
      `;

      const queryParams = [
        ...(filters.staffId ? [filters.staffId] : []),
        ...(filters.targetId ? [filters.targetId] : []),
        ...params,
        pageSize,
        offset,
      ];

      const [rows] = await pool.execute<RowDataPacket[]>(query, queryParams);
      const total = rows[0]?.total || 0;

      if (filters.staffId || filters.targetId || (params[0] && params[1])) {
        const filterDescription = [];

        if (filters.staffId) {
          filterDescription.push(`스태프: ${filters.staffId}`);
        }
        if (filters.targetId) {
          filterDescription.push(`대상: ${filters.targetId}`);
        }
        if (params[0] && params[1]) {
          filterDescription.push(
            `범위: ${params[0].slice(0, 10)} ~ ${params[1].slice(0, 10)}`
          );
        }

        await this.writeAdminLog(
          `스태프 로그 조회 (${filterDescription.join(", ")})`
        );
      }

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

  async deleteGameLogs(
    ids: number[]
  ): Promise<ApiResponse<{ deletedCount: number }>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "세션이 존재하지 않습니다",
        data: null,
      };
    }

    if (!hasAccess(session.user.role, UserRole.MASTER)) {
      return {
        success: false,
        error: "권한이 없습니다",
        data: null,
      };
    }

    try {
      const deletedRows = await db.deleteLogsByIds(ids);

      await this.writeAdminLog(`${deletedRows.count}개 유저 로그 삭제`);

      return {
        success: true,
        data: { deletedCount: deletedRows.count },
        error: null,
      };
    } catch (error) {
      console.error("Delete game logs error:", error);
      return {
        success: false,
        error: "로그 삭제 중 오류가 발생했습니다",
        data: null,
      };
    }
  }

  async getGameLogsStats(): Promise<
    ApiResponse<{
      totalCount: number;
      lastHourCount: number;
      errorCount: number;
      typeDistribution: Record<string, number>;
    }>
  > {
    try {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const stats = await db.sql`
        SELECT
          (SELECT COUNT(*) FROM game_logs) as total_count,
          (SELECT COUNT(*) FROM game_logs WHERE timestamp >= ${hourAgo}) as last_hour_count,
          (SELECT COUNT(*) FROM game_logs WHERE level = 'error') as error_count,
          (
            SELECT jsonb_object_agg(type, count)
            FROM (
              SELECT type, COUNT(*) as count
              FROM game_logs
              GROUP BY type
            ) type_counts
          ) as type_distribution
      `;

      return {
        success: true,
        data: {
          totalCount: stats[0].total_count,
          lastHourCount: stats[0].last_hour_count,
          errorCount: stats[0].error_count,
          typeDistribution: stats[0].type_distribution || {},
        },
        error: null,
      };
    } catch (error) {
      console.error("Get game logs stats error:", error);
      return {
        success: false,
        error: "로그 통계 조회 중 오류가 발생했습니다",
        data: null,
      };
    }
  }

  async getLogHealthCheck(): Promise<
    ApiResponse<{
      isHealthy: boolean;
      lastLogTimestamp: Date | null;
      avgInsertLatency: number;
    }>
  > {
    try {
      const stats = await db.sql`
        WITH latency_stats AS (
          SELECT 
            AVG(EXTRACT(EPOCH FROM (lead(timestamp) OVER (ORDER BY timestamp) - timestamp))) as avg_latency,
            MAX(timestamp) as last_timestamp
          FROM game_logs
          WHERE timestamp >= NOW() - INTERVAL '1 hour'
        )
        SELECT 
          CASE 
            WHEN last_timestamp >= NOW() - INTERVAL '5 minutes' THEN true 
            ELSE false 
          END as is_healthy,
          last_timestamp,
          COALESCE(avg_latency, 0) as avg_latency
        FROM latency_stats
      `;

      return {
        success: true,
        data: {
          isHealthy: stats[0].is_healthy,
          lastLogTimestamp: stats[0].last_timestamp,
          avgInsertLatency: stats[0].avg_latency,
        },
        error: null,
      };
    } catch (error) {
      console.error("Get log health check error:", error);
      return {
        success: false,
        error: "로그 상태 확인 중 오류가 발생했습니다",
        data: null,
      };
    }
  }

  async writeAdminLog(content: string) {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "세션이 존재하지 않습니다",
        data: null,
      };
    }
    const currentTime = new Date();
    try {
      const existingLog = await prisma.accountUsingQuerylog.findFirst({
        where: {
          content: content,
          createdAt: {
            gte: new Date(currentTime.getTime() - 1000),
            lt: new Date(currentTime.getTime() + 1000),
          },
        },
      });

      if (existingLog) {
        return;
      }

      await prisma.accountUsingQuerylog.create({
        data: {
          content: `${session.user.nickname}(${session.user.userId}) > ${content}`,
          registrantId: session.user.id,
        },
      });
    } catch (error) {
      console.error("로그를 작성하는 중 에러가 발생하였습니다.", error);
    }
  }

  async getRecipeLogs(
    filters: RecipeLogFilter
  ): Promise<ApiResponse<RecipeLogResponse>> {
    try {
      const pageSize = 50;
      const page = filters.page || 1;
      const offset = (page - 1) * pageSize;

      let params: any[] = [];
      let dateFilter = "";

      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);

        startDate.setHours(9, 0, 0, 0);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(8, 59, 59, 999);

        dateFilter = " AND create_time >= ? AND create_time <= ?";
        params = [
          startDate.toISOString().slice(0, 19).replace("T", " "),
          endDate.toISOString().slice(0, 19).replace("T", " "),
        ];
      }

      const query = `
        SELECT 
          id,
          user_id,
          recipe_id,
          reward_item,
          create_time,
          COUNT(*) OVER() as total
        FROM dokku_recipe_log
        WHERE 1=1
        ${filters.userId ? " AND user_id = ?" : ""}
        ${filters.recipeId ? " AND recipe_id LIKE ?" : ""}
        ${filters.rewardItem ? " AND reward_item LIKE ?" : ""}
        ${dateFilter}
        ORDER BY create_time DESC
        LIMIT ? OFFSET ?
      `;

      const queryParams = [
        ...(filters.userId ? [filters.userId] : []),
        ...(filters.recipeId ? [`%${filters.recipeId}%`] : []),
        ...(filters.rewardItem ? [`%${filters.rewardItem}%`] : []),
        ...params,
        pageSize,
        offset,
      ];

      const [rows] = await pool.execute<RowDataPacket[]>(query, queryParams);
      const total = rows[0]?.total || 0;

      if (
        filters.userId ||
        filters.recipeId ||
        filters.rewardItem ||
        (params[0] && params[1])
      ) {
        const filterDescription = [];

        if (filters.userId) {
          filterDescription.push(`유저: ${filters.userId}`);
        }
        if (filters.recipeId) {
          filterDescription.push(`레시피: ${filters.recipeId}`);
        }
        if (filters.rewardItem) {
          filterDescription.push(`보상: ${filters.rewardItem}`);
        }
        if (params[0] && params[1]) {
          filterDescription.push(
            `범위: ${params[0].slice(0, 10)} ~ ${params[1].slice(0, 10)}`
          );
        }

        await this.writeAdminLog(
          `레시피 로그 조회 (${filterDescription.join(", ")})`
        );
      }

      return {
        success: true,
        data: {
          records: rows.map(({ total, ...row }) => row) as RecipeLog[],
          total,
          page,
          totalPages: Math.ceil(total / pageSize),
          pageSize,
        },
        error: null,
      };
    } catch (error) {
      console.error("레시피 로그 조회 에러:", error);
      return {
        success: false,
        data: {
          records: [],
          total: 0,
          page: 1,
          totalPages: 1,
          pageSize: 50,
        },
        error: "레시피 로그 조회에 실패했습니다.",
      };
    }
  }

  async getRecipeLogsByIds(ids: number[]) {
    const query = `
        SELECT 
          id,
          user_id,
          recipe_id,
          reward_item,
          create_time,
          COUNT(*) OVER() as total
        FROM dokku_recipe_log
        WHERE id IN (?)
        ORDER BY create_time DESC
      `;
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, [ids]);
      await this.writeAdminLog(`${rows.length}개 레시피 로그 CSV 다운로드`);
      return {
        success: true,
        data: rows,
        error: null,
      };
    } catch (error) {
      console.error("레시피 로그 조회 에러:", error);
      return {
        success: false,
        data: [],
        error: "레시피 로그 조회 에러",
      };
    }
  }

  async getUserRelatedLogs(
    userId: number,
    page: number = 1,
    filters: {
      type?: string;
      level?: string;
      message?: string;
    } = {}
  ): Promise<ApiResponse<GameLogResponse>> {
    try {
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      // 기본 조건: 유저 ID 관련 조건
      let whereConditions = [
        `(
          metadata->>'user_id' = $1
          OR metadata->>'target_id' = $1
          OR metadata->'user_id' = $2
          OR metadata->'target_id' = $2
        )`,
      ];

      // 파라미터 배열 초기화
      let params = [userId.toString(), userId, pageSize, offset];
      let paramCounter = 5; // 이미 4개의 파라미터가 있으므로 5부터 시작

      // filters 객체에서 각 필터 적용
      if (filters.type) {
        whereConditions.push(`type = $${paramCounter}`);
        params.push(filters.type);
        paramCounter++;
      }

      if (filters.level) {
        whereConditions.push(`level = $${paramCounter}`);
        params.push(filters.level);
        paramCounter++;
      }

      if (filters.message) {
        whereConditions.push(`message ILIKE $${paramCounter}`);
        params.push(`%${filters.message}%`); // 부분 일치 검색
        paramCounter++;
      }

      // 모든 조건을 AND로 결합
      const whereClause = whereConditions.join(" AND ");

      const query = `
        WITH filtered_logs AS (
          SELECT 
            id,
            timestamp,
            level,
            type,
            message,
            metadata,
            COUNT(*) OVER() as total_count
          FROM game_logs
          WHERE ${whereClause}
          ORDER BY timestamp DESC
          LIMIT $3 OFFSET $4
        )
        SELECT * FROM filtered_logs
      `;

      const result = await db.sql.unsafe(query, params);

      const totalCount = result.length > 0 ? result[0].total_count : 0;

      await this.writeAdminLog(
        `유저 ID ${userId}의 관련 로그 조회 (${page}페이지)`
      );

      return {
        success: true,
        data: {
          records: result.map(({ total_count, ...log }) => ({
            id: log.id,
            timestamp: log.timestamp,
            level: log.level,
            type: log.type,
            message: log.message,
            metadata: log.metadata,
          })),
          total: totalCount,
          page,
          totalPages: Math.ceil(totalCount / pageSize),
        },
        error: null,
      };
    } catch (error) {
      console.error("유저 관련 로그 조회 에러:", error);
      return {
        success: false,
        data: {
          records: [],
          total: 0,
          page: 1,
          totalPages: 1,
        },
        error: "로그 조회 중 오류가 발생했습니다.",
      };
    }
  }
}

export const logService = new LogService();
