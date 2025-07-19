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

// 환경변수 상수 초기화
const PARTITION_LOG_URL = process.env.PARTITION_LOG_URL || "";
const SHIBA_LOG_API_KEY = process.env.SHIBA_LOG_API_KEY || "";

// 개발 환경에서 환경변수 로드 상태 확인
if (process.env.NODE_ENV === 'development') {
  console.log('log-service.ts 환경변수 초기화:', {
    PARTITION_LOG_URL: PARTITION_LOG_URL ? PARTITION_LOG_URL.substring(0, 20) + '...' : 'NOT_SET',
    SHIBA_LOG_API_KEY: SHIBA_LOG_API_KEY ? '설정됨 (길이: ' + SHIBA_LOG_API_KEY.length + ')' : 'NOT_SET'
  });
}

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
  private readonly FLUSH_INTERVAL = parseInt(process.env.LOG_FLUSH_INTERVAL_MS ?? "60000");
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
      await Promise.race([
        db.batchInsert(logsToProcess),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("DB insert timeout")), 10_000)
        ),
      ]);
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
        conditions.push(`type ILIKE $${paramIndex++}`);
        params.push(`%${filters.type}%`);
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

      // 개발 환경에서 디버깅 로그
      if (process.env.NODE_ENV === 'development') {
        console.log('getGameLogs 디버깅:', {
          countQuery,
          countParams,
          totalCount,
          rawTotal: countResult[0]?.total,
          totalType: typeof countResult[0]?.total,
          filters
        });
      }

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

      console.log(records);


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
          databaseLogs: totalCount, // 데이터베이스 로그 수 추가
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
          databaseLogs: 0,
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

    // 마스터 이상 권한에서 1개 미만 삭제 불가
    if (ids.length < 1) {
      return {
        success: false,
        error: "삭제할 항목을 최소 1개 이상 선택해주세요",
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

  async exportGameLogsByDateRange(startDate: string, endDate: string) {
    // startDate, endDate: 'YYYY-MM-DD'
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    try {
      // DB 쿼리: timestamp >= start AND timestamp <= end
      const logs = await db.sql.unsafe(
        `SELECT id, timestamp, level, type, message, metadata FROM game_logs WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp DESC`,
        [start, end]
      );
      return {
        success: true,
        data: logs,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "CSV 기간 다운로드 실패",
      };
    }
  }

  async exportAdminLogsByDateRange(startDate: string, endDate: string) {
    // startDate, endDate: 'YYYY-MM-DD'
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    try {
      const logs = await prisma.accountUsingQuerylog.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          registrant: {
            select: {
              userId: true,
              nickname: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // 데이터 변환
      const transformedLogs = logs.map(({ registrant, ...record }) => ({
        id: record.id,
        content: record.content,
        registrantId: record.registrantId,
        registrantUserId: registrant?.userId || null,
        registrantNickname: registrant?.nickname || null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }));

      await this.writeAdminLog(
        `운영툴 로그 CSV 기간 다운로드 (${startDate} ~ ${endDate})`
      );

      return {
        success: true,
        data: transformedLogs,
        error: null,
      };
    } catch (error) {
      console.error("Export admin logs by date range error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "CSV 기간 다운로드 실패",
      };
    }
  }
}

// 새로운 파티션 로그 시스템 관련 인터페이스
interface NewGameLog {
  id?: number;
  type: string;
  message: string;
  level?: string;
  metadata?: { [key: string]: any };
  timestamp?: string;
}

interface NewLogQuery {
  type?: string;
  level?: string;
  message?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  userId?: number;
  metadata?: string;
}

interface NewLogsResponse {
  success: boolean;
  data?: {
    memory: {
      records: NewGameLog[];
      total: number;
      page: number;
      totalPages: number;
    };
    database: {
      records: NewGameLog[];
      total: string;
      page: number;
      totalPages: number;
    };
    combined: {
      totalMemoryLogs: number;
      totalDatabaseLogs: number;
      bufferSize: number;
    };
  };
  error?: string;
  timestamp?: string;
}

interface LogStatsResponse {
  success: boolean;
  data?: {
    server: {
      uptime: number;
      memoryUsage: any;
      nodeVersion: string;
      environment: string;
    };
    logStore: {
      bufferSize: number;
      batchSize: number;
      flushInterval: number;
      isProcessing: boolean;
      lastProcessedAt: string | null;
    };
    database: {
      connectionString: string;
    };
  };
  error?: string;
  timestamp?: string;
}

// 새로운 파티션 로그 서비스 클래스
class NewLogService {
  private readonly apiKey = SHIBA_LOG_API_KEY;
  private readonly baseUrl = PARTITION_LOG_URL;

  constructor() {
    // 개발 환경에서 환경변수 로드 상태 확인
    if (process.env.NODE_ENV === 'development') {
      console.log('NewLogService 인스턴스 생성:', {
        hasApiKey: !!this.apiKey,
        hasBaseUrl: !!this.baseUrl,
        apiKeyLength: this.apiKey.length,
        baseUrl: this.baseUrl ? this.baseUrl.substring(0, 20) + '...' : 'NOT_SET'
      });
    }

    if (!this.apiKey || !this.baseUrl) {
      console.warn('NewLogService: 필수 환경변수가 설정되지 않았습니다', {
        SHIBA_LOG_API_KEY: !!this.apiKey,
        PARTITION_LOG_URL: !!this.baseUrl
      });
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log('makeRequest:', url);

    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getPartitionLogs(filters: NewLogQuery): Promise<ApiResponse<{
    records: NewGameLog[];
    total: number;
    page: number;
    totalPages: number;
    memoryLogs: number;
    databaseLogs: number;
    bufferSize: number;
    totalRow : string;
  }>> {
    try {
      const params = new URLSearchParams();

      if (filters.type) params.set('type', filters.type);
      if (filters.level) params.set('level', filters.level);
      if (filters.message) params.set('message', filters.message);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.userId) params.set('userId', filters.userId.toString());
      if (filters.metadata) params.set('metadata', filters.metadata);

      const endpoint = `/api/logs${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.makeRequest<NewLogsResponse>(endpoint);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch logs');
      }

      // 서버에서 이미 필터링되고 페이지네이션된 데이터 사용
      const memoryRecords = response.data.memory?.records || [];
      const dbRecords = response.data.database?.records || [];

      // 서버에서 온 데이터에 클라이언트 사이드 추가 필터링 적용
      let filteredMemoryRecords = [...memoryRecords];
      let filteredDbRecords = [...dbRecords];


      // 메타데이터 필터링 (서버에서 지원하지 않을 경우를 대비)
      if (filters.metadata) {
        const metadataFilter = filters.metadata.toLowerCase();

        filteredMemoryRecords = filteredMemoryRecords.filter((log: NewGameLog) => {
          if (!log.metadata) return false;
          const metadataStr = JSON.stringify(log.metadata).toLowerCase();
          return metadataStr.includes(metadataFilter);
        });

        filteredDbRecords = filteredDbRecords.filter((log: NewGameLog) => {
          if (!log.metadata) return false;
          const metadataStr = JSON.stringify(log.metadata).toLowerCase();
          return metadataStr.includes(metadataFilter);
        });
      }

      // 시간순으로 정렬 (최신순) - 필터링된 메모리 데이터와 DB 데이터 결합
      const allRecords = [...filteredMemoryRecords, ...filteredDbRecords].sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });


      // 서버에서 제공하는 실제 총계 정보 사용 (명시적 숫자 변환)
      const serverMemoryTotal = Number(response.data.memory?.total || 0);
      const serverDatabaseTotal = Number(response.data.database?.total || 0);
      const serverTotalRecords = serverMemoryTotal + serverDatabaseTotal;

      // 페이지 정보는 서버 응답 기준으로 계산
      const currentPage = filters.page || 1;
      const limit = filters.limit || 50;

      // 서버의 실제 총 페이지 수 사용
      const databaseTotalPages = Number(response.data.database?.totalPages || 0);
      const memoryTotalPages = Number(response.data.memory?.totalPages || 0);
      const totalPages = Math.max(databaseTotalPages, memoryTotalPages, Math.ceil(serverTotalRecords / limit));

      // 개발 환경에서 디버깅 로그
      if (process.env.NODE_ENV === 'development') {
        console.log('페이지네이션 정보 (서버 기준):', {
          currentPage,
          totalPages,
          limit,
          serverTotalRecords,
          serverMemoryTotal,
          serverDatabaseTotal,
          databaseTotalPages,
          memoryTotalPages,
          serverMemoryRecords: memoryRecords.length,
          serverDbRecords: dbRecords.length,
          filteredMemoryRecords: filteredMemoryRecords.length,
          filteredDbRecords: filteredDbRecords.length,
          combinedRecords: allRecords.length,
          totalRow: response.data.database.total,
          appliedFilters: {
            metadata: filters.metadata,
            userId: filters.userId,
            type: filters.type,
            level: filters.level,
            message: filters.message
          }
        });
      }

      await this.writeAdminLog(
        `새로운 파티션 로그 조회 (${[
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
          records: allRecords,
          total: serverTotalRecords,
          page: currentPage,
          totalPages: totalPages,
          memoryLogs: serverMemoryTotal,
          databaseLogs: serverDatabaseTotal,
          bufferSize: Number(response.data.combined?.bufferSize || 0),
          totalRow: response.data.database.total
        },
        error: null,
      };
    } catch (error) {
      console.error("새로운 파티션 로그 조회 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "새로운 파티션 로그 조회 실패",
        data: {
          records: [],
          total: 0,
          page: 1,
          totalPages: 1,
          memoryLogs: 0,
          databaseLogs: 0,
          bufferSize: 0,
          totalRow : "0"
        },
      };
    }
  }

  async getLogStats(): Promise<ApiResponse<LogStatsResponse['data']>> {
    try {
      const response = await this.makeRequest<LogStatsResponse>('/api/logs/stats');

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch stats');
      }

      return {
        success: true,
        data: response.data!,
        error: null,
      };
    } catch (error) {
      console.error("로그 통계 조회 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "로그 통계 조회 실패",
        data: null,
      };
    }
  }

  async flushLogs(): Promise<ApiResponse<{ processed: number; remainingBuffer: number }>> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        message: string;
        processed: number;
        remainingBuffer: number;
        timestamp: string;
      }>('/api/logs/flush', {
        method: 'POST',
      });

      await this.writeAdminLog("새로운 파티션 로그 강제 플러시 실행");

      return {
        success: true,
        data: {
          processed: response.processed,
          remainingBuffer: response.remainingBuffer,
        },
        error: null,
      };
    } catch (error) {
      console.error("로그 플러시 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "로그 플러시 실패",
        data: null,
      };
    }
  }

  async getHealthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest<any>('/api/logs/health');

      return {
        success: true,
        data: response,
        error: null,
      };
    } catch (error) {
      console.error("헬스체크 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "헬스체크 실패",
        data: null,
      };
    }
  }

  async exportPartitionLogsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<NewGameLog[]>> {
    try {
      const filters = {
        startDate,
        endDate,
        page: 1,
        limit: 10000, // 충분히 큰 수로 설정
      };

      const response = await this.makeRequest<NewLogsResponse>(`/api/logs?${new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      }).toString()}`);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch logs');
      }

      // 메모리와 DB 로그를 합쳐서 반환
      const memoryRecords = response.data.memory?.records || [];
      const dbRecords = response.data.database?.records || [];

      // 필터링과 정렬
      const filteredMemoryRecords = memoryRecords.filter((log: NewGameLog) => {
        if (filters.startDate) {
          const logDate = new Date(log.timestamp || 0);
          const filterDate = new Date(filters.startDate);
          if (logDate < filterDate) return false;
        }
        if (filters.endDate) {
          const logDate = new Date(log.timestamp || 0);
          const filterDate = new Date(filters.endDate);
          filterDate.setHours(23, 59, 59, 999);
          if (logDate > filterDate) return false;
        }
        return true;
      });

      const allRecords = [...filteredMemoryRecords, ...dbRecords].sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      await this.writeAdminLog(
        `새로운 파티션 로그 CSV 기간 다운로드 (${startDate} ~ ${endDate})`
      );

      return {
        success: true,
        data: allRecords,
        error: null,
      };
    } catch (error) {
      console.error("파티션 로그 날짜 범위 export 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "파티션 로그 날짜 범위 export 실패",
        data: null,
      };
    }
  }

  private async writeAdminLog(content: string) {
    // 기존 logService의 writeAdminLog 재사용
    const session = await auth();
    if (!session?.user) return;

    try {
      const currentTime = new Date();
      const existingLog = await prisma.accountUsingQuerylog.findFirst({
        where: {
          content: content,
          createdAt: {
            gte: new Date(currentTime.getTime() - 1000),
            lt: new Date(currentTime.getTime() + 1000),
          },
        },
      });

      if (existingLog) return;

      await prisma.accountUsingQuerylog.create({
        data: {
          content: `${session.user.nickname}(${session.user.userId}) > ${content}`,
          registrantId: session.user.id,
        },
      });
    } catch (error) {
      console.error("관리자 로그 작성 중 에러:", error);
    }
  }
}

export const newLogService = new NewLogService();
export const logService = new LogService();
