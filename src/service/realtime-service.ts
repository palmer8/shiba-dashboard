import pool from "@/db/mysql";
import prisma from "@/db/prisma";
import { auth } from "@/lib/auth-config";
import {
  formatKoreanNumber,
  hasAccess,
  parseCustomDateString,
  ROLE_HIERARCHY,
} from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { RowDataPacket } from "mysql2";
import { ApiResponse } from "@/types/global.dto";
import { reportService } from "@/service/report-service";
import { CompanyResult, InstagramResult } from "@/types/game";
import { redirect } from "next/navigation";
import { RealtimeGameUserData } from "@/types/user";

type ComparisonOperator = "gt" | "gte" | "lt" | "lte" | "eq";
type PaginationParams = { page: number };
type BaseQueryResult = {
  id: number;
  nickname: string;
  first_join: Date;
  result: string;
  type: string;
};

interface PaginatedResult<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// 비교 연산자 SQL 생성 유틸리티
function getComparisonOperator(operator: ComparisonOperator): string {
  switch (operator) {
    case "gt":
      return ">";
    case "gte":
      return ">=";
    case "lt":
      return "<";
    case "lte":
      return "<=";
    case "eq":
      return "=";
    default:
      return "=";
  }
}

class RealtimeService {
  private readonly BASE_URL = process.env.PRIVATE_API_URL;
  private readonly API_KEY = process.env.PRIVATE_API_KEY || "";
  private readonly DEFAULT_TIMEOUT = 5000;

  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.DEFAULT_TIMEOUT
    );

    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          key: this.API_KEY,
          ...options.headers,
        },
        signal: controller.signal,
        next: { revalidate: 15 }, // 브라우저 캐시 15초 활용
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // 타임아웃이나 네트워크 에러시 한 번만 재시도
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "TypeError")
      ) {
        clearTimeout(timeoutId);
        return this.fetchWithRetry<T>(endpoint, options);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getGameUserDataByUserId(
    userId: number
  ): Promise<ApiResponse<RealtimeGameUserData>> {
    try {
      // 1. 기본 유저 데이터를 하나의 쿼리로 조회
      const userDataQuery = `
        SELECT 
          n.code as newbie_code,
          COALESCE(w.count, 0) as warning_count,
          p.phone_number,
          p.pin,
          REPLACE(v.identifier, 'discord:', '') as discord_id
        FROM (SELECT ? as user_id) as u
        LEFT JOIN dokku_newbie n ON n.user_id = u.user_id
        LEFT JOIN dokku_warning w ON w.user_id = u.user_id
        LEFT JOIN phone_phones p ON p.id = u.user_id
        LEFT JOIN vrp_user_ids v ON v.user_id = u.user_id 
          AND v.identifier LIKE 'discord:%'
        LIMIT 1
      `;

      // 2. 병렬로 실행: DB 쿼리와 API 요청
      const [[[basicUserData]], userDataResponse, incidentReports] =
        await Promise.all([
          pool.execute<RowDataPacket[]>(userDataQuery, [userId]),
          this.fetchWithRetry("/DokkuApi/getPlayerData", {
            method: "POST",
            body: JSON.stringify({ user_id: userId }),
          }),
          reportService.getIncidentReportsByTargetUserId(userId),
        ]);

      if (!userDataResponse) {
        return {
          success: false,
          data: null,
          error: "유저 데이터 조회 실패",
        };
      }

      // 3. 데이터 통합
      const enrichedData = {
        ...userDataResponse,
        newbieCode: basicUserData?.newbie_code ?? null,
        warningCount: basicUserData?.warning_count ?? 0,
        incidentReports: incidentReports.success
          ? incidentReports.data.records
          : [],
        lbPhoneNumber: basicUserData?.phone_number ?? null,
        lbPhonePin: basicUserData?.pin ?? null,
        discordId: basicUserData?.discord_id ?? null,
      };

      return {
        success: true,
        data: enrichedData as unknown as RealtimeGameUserData,
        error: null,
      };
    } catch (error) {
      console.error("getGameUserDataByUserId error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했습니다",
      };
    }
  }

  async getGroupDataByGroupName(groupName: string, cursor?: number) {
    const groupDataResponse = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/getPlayersGroupFind`,
      {
        method: "POST",
        body: JSON.stringify({ groupWord: groupName, cursor: cursor || 0 }),
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
      }
    );

    const groupData = await groupDataResponse.json();

    return {
      success: true,
      message: "그룹 데이터 조회 성공",
      data: groupData,
      error: null,
    };
  }

  async getUserGroups(userId: number) {
    const session = await auth();

    if (!session) {
      return {
        success: false,
        message: "세션 정보가 없습니다",
        data: null,
        error: null,
      };
    }

    const getUserGroupsResponse = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/getplayerGroup`,
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
      }
    );

    const userGroups = await getUserGroupsResponse.json();

    return {
      success: true,
      data: userGroups,
      error: null,
    };
  }

  async getGroupsByGroupId(groupId: string): Promise<
    ApiResponse<
      {
        groupId: string;
        groupBoolean: boolean;
      }[]
    >
  > {
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        data: null,
        error: "Unauthorized",
      };
    }

    const userRole = session.user.role as UserRole;

    const groups = await prisma.groups.findMany({
      select: {
        groupId: true,
        groupBoolean: true,
      },
      where: {
        AND: [
          {
            groupId: {
              contains: groupId,
              mode: "insensitive",
            },
          },
          {
            minRole: {
              in: Object.keys(ROLE_HIERARCHY).filter(
                (role) =>
                  ROLE_HIERARCHY[role as UserRole] <= ROLE_HIERARCHY[userRole]
              ) as UserRole[],
            },
          },
        ],
      },
      orderBy: {
        groupId: "asc",
      },
      take: 5,
    });

    return {
      success: true,
      data: groups,
      error: null,
    };
  }

  async getItemsByItemName(itemName: string) {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: "권한이 없습니다.",
        data: [],
        error: "Unauthorized",
      };
    }

    const items = await prisma.items.findMany({
      select: {
        itemId: true,
        itemName: true,
      },
      where: {
        itemName: {
          contains: itemName,
          mode: "insensitive",
        },
      },
      orderBy: { itemName: "asc" },
      take: 5,
    });

    return {
      success: true,
      message: "아이템 조회 성공",
      data: items,
      error: null,
    };
  }

  async getGameDataByItemType(
    query: {
      itemId: string;
      value: number;
      condition: ComparisonOperator;
      type: "ITEM_CODE" | "ITEM_NAME";
    } & PaginationParams
  ): Promise<PaginatedResult<BaseQueryResult>> {
    try {
      const { itemId, value, condition, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;
      const operator = getComparisonOperator(condition);
      const amountPath = `$.${itemId}.amount`;

      // 단일 쿼리로 통합
      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          CAST(JSON_EXTRACT(ud.inventory, ?) AS SIGNED) as amount,
          COUNT(*) OVER() as total
        FROM vrp_user_data ud
        INNER JOIN vrp_users u ON u.id = ud.user_id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE JSON_EXTRACT(ud.inventory, ?) IS NOT NULL
        AND CAST(JSON_EXTRACT(ud.inventory, ?) AS SIGNED) ${operator} ?
        ORDER BY amount DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        amountPath,
        amountPath,
        amountPath,
        value,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: rows.map(
          (row: RowDataPacket): BaseQueryResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: row.first_join,
            result: `${formatKoreanNumber(row.amount)}개`,
            type: query.type,
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("아이템 데이터 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }

  // 차량 번호 조회
  async getGameDataByRegistration(
    query: {
      value: string;
    } & PaginationParams
  ): Promise<PaginatedResult<BaseQueryResult>> {
    try {
      const { value, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      // 단일 쿼리로 통합, 인덱스 활용 최적화
      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          ui.registration as amount,
          COUNT(*) OVER() as total
        FROM vrp_user_identities ui
        INNER JOIN vrp_users u ON u.id = ui.user_id
        WHERE ui.registration = ?
        ORDER BY ui.registration
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        value,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: rows.map(
          (row: RowDataPacket): BaseQueryResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: row.first_join,
            result: row.amount,
            type: "registration",
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("차량 번호 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }

  // 캐시 관련 조회
  async getGameDataByCredit(
    query: {
      creditType: "CREDIT" | "CREDIT2";
      value: number;
      condition: ComparisonOperator;
    } & PaginationParams
  ): Promise<PaginatedResult<BaseQueryResult>> {
    try {
      const { creditType, value, condition, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;
      const operator = getComparisonOperator(condition);
      const creditField = creditType.toLowerCase();

      // 단일 쿼리로 통합
      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          um.${creditField} as amount,
          COUNT(*) OVER() as total
        FROM vrp_user_moneys um
        INNER JOIN vrp_users u ON u.id = um.user_id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE um.${creditField} ${operator} ?
        ORDER BY amount DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        value,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: rows.map(
          (row: RowDataPacket): BaseQueryResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: parseCustomDateString(row.first_join),
            result: `${formatKoreanNumber(row.amount)}개`,
            type: creditType,
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("캐시 데이터 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }

  // 현금/계좌 조회
  async getGameDataByMoney(
    query: {
      moneyType: "WALLET" | "BANK";
      value: number;
      condition: ComparisonOperator;
    } & PaginationParams
  ): Promise<PaginatedResult<BaseQueryResult>> {
    try {
      const { moneyType, value, condition, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;
      const operator = getComparisonOperator(condition);
      const moneyField = moneyType.toLowerCase();

      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          um.${moneyField} as amount
        FROM vrp_user_moneys um
        INNER JOIN vrp_users u ON u.id = um.user_id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE um.${moneyField} ${operator} ?
        ORDER BY amount DESC
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM vrp_user_moneys
        WHERE ${moneyField} ${operator} ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        value,
        pageSize,
        offset,
      ]);

      const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, [
        value,
      ]);

      const total = countRows[0].total;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: rows.map(
          (row: RowDataPacket): BaseQueryResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: parseCustomDateString(row.first_join),
            result: `${formatKoreanNumber(row.amount)}원`,
            type: moneyType,
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("재화 데이터 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }

  async getGameDataByMileage(
    query: {
      value: number;
      condition: ComparisonOperator;
    } & PaginationParams
  ): Promise<PaginatedResult<BaseQueryResult>> {
    try {
      const { value, condition, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;
      const operator = getComparisonOperator(condition);

      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          dc.current_coin as amount
        FROM dokku_cashshop dc
        INNER JOIN vrp_users u ON u.id = dc.user_id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE dc.current_coin ${operator} ?
        ORDER BY amount DESC
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM dokku_cashshop
        WHERE current_coin ${operator} ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        value,
        pageSize,
        offset,
      ]);

      const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, [
        value,
      ]);

      const total = countRows[0].total;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: rows.map(
          (row: RowDataPacket): BaseQueryResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: row.first_join,
            result: `${formatKoreanNumber(row.amount)}`,
            type: "MILEAGE",
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("마일리지 데이터 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }

  async getGameDataByCash(
    query: {
      cashType: "CURRENT_CASH" | "ACCUMULATED_CASH";
      value: number;
      condition: ComparisonOperator;
    } & PaginationParams
  ): Promise<PaginatedResult<BaseQueryResult>> {
    const session = await auth();
    if (!session || !session.user) {
      return redirect("/");
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return redirect("/");
    }

    try {
      const { cashType, value, condition, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;
      const operator = getComparisonOperator(condition);
      const cashField =
        cashType === "CURRENT_CASH" ? "current_cash" : "cumulative_cash";

      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          dc.${cashField} as amount
        FROM dokku_cashshop dc
        INNER JOIN vrp_users u ON u.id = dc.user_id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE dc.${cashField} ${operator} ?
        ORDER BY amount DESC
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM dokku_cashshop
        WHERE ${cashField} ${operator} ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        value,
        pageSize,
        offset,
      ]);

      const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, [
        value,
      ]);

      const total = countRows[0].total;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: rows.map(
          (row: RowDataPacket): BaseQueryResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: row.first_join,
            result: `${formatKoreanNumber(row.amount)}원`,
            type: cashType,
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("캐시 데이터 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }

  async getRealtimeUser(): Promise<ApiResponse<number>> {
    try {
      const data = await this.fetchWithRetry<{ playerNum: number }>(
        "/DokkuApi/getPlayersCount",
        { method: "POST" }
      );
      return {
        success: true,
        data: data.playerNum || 0,
        error: null,
      };
    } catch (error) {
      console.error("Realtime user count error:", error);
      return {
        success: true,
        data: 0,
        error: null,
      };
    }
  }

  async getAdminData(): Promise<
    ApiResponse<{
      count: number;
      users: Array<{ user_id: number; name: string }>;
    }>
  > {
    try {
      const data = await this.fetchWithRetry<{
        count: number;
        users: Array<{ user_id: number; name: string }>;
      }>("/DokkuApi/getAdmin", { method: "POST" });

      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      console.error("Admin data error:", error);
      return {
        success: true,
        data: {
          count: 0,
          users: [],
        },
        error: null,
      };
    }
  }

  async getWeeklyNewUsersStats(): Promise<
    ApiResponse<
      Array<{
        date: string;
        count: number;
        changePercentage: number;
      }>
    >
  > {
    try {
      const query = `
        WITH RECURSIVE dates AS (
          SELECT CURDATE() as date
          UNION ALL
          SELECT DATE_SUB(date, INTERVAL 1 DAY)
          FROM dates
          WHERE DATE_SUB(date, INTERVAL 1 DAY) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        ),
        daily_counts AS (
          SELECT 
            DATE(first_join) as join_date,
            COUNT(*) as user_count
          FROM vrp_user_identities
          WHERE first_join >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
          GROUP BY DATE(first_join)
        )
        SELECT 
          dates.date,
          COALESCE(daily_counts.user_count, 0) as count,
          COALESCE(
            ROUND(
              CASE 
                WHEN prev_day.user_count = 0 THEN 0
                ELSE ((daily_counts.user_count - prev_day.user_count) / prev_day.user_count * 100)
              END, 
              1
            ),
            0
          ) as change_percentage
        FROM dates
        LEFT JOIN daily_counts ON dates.date = daily_counts.join_date
        LEFT JOIN daily_counts prev_day ON dates.date = DATE_ADD(prev_day.join_date, INTERVAL 1 DAY)
        ORDER BY dates.date DESC;
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(query);

      return {
        success: true,
        data: rows.map((row) => ({
          date: new Date(row.date).toISOString().split("T")[0],
          count: Number(row.count),
          changePercentage: Number(row.change_percentage),
        })),
        error: null,
      };
    } catch (error) {
      console.error("Weekly stats error:", error);
      const defaultData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split("T")[0],
          count: 0,
          changePercentage: 0,
        };
      });

      return {
        success: true,
        data: defaultData,
        error: null,
      };
    }
  }

  async returnPlayerSkin(userId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `${process.env.PRIVATE_API_URL}/DokkuApi/returnPlayerSkin`,
        {
          method: "POST",
          body: JSON.stringify({ user_id: userId }),
          headers: {
            "Content-Type": "application/json",
            key: process.env.PRIVATE_API_KEY || "",
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        let errorMessage = "알 수 없는 오류가 발생했습니다.";
        switch (data.type) {
          case "MISSING_PARAMETER":
            errorMessage = "필수 파라미터가 누락되었습니다.";
            break;
          case "NOT_WEARING_SKIN":
            errorMessage = "플레이어가 스킨을 착용 중이지 않습니다.";
            break;
          case "USER_NOT_FOUND":
            errorMessage = "존재하지 않는 플레이어입니다.";
            break;
          case "SERVER_ERROR":
            errorMessage = "서버 오류가 발생했습니다.";
            break;
        }

        return {
          success: false,
          data: null,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: data,
        error: null,
      };
    } catch (error) {
      console.error("Return player skin error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  async getGameDataByUsername(query: {
    value: string;
    page: number;
  }): Promise<PaginatedResult<BaseQueryResult>> {
    try {
      const { value, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      // 단일 쿼리로 통합하고 COUNT(*) OVER() 사용
      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          u.last_login as result,
          COUNT(*) OVER() as total
        FROM vrp_users u
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE SUBSTRING_INDEX(u.last_login, ' ', -1) LIKE ?
        ORDER BY u.id DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        `%${value}%`,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;

      return {
        data: rows.map((row) => ({
          id: row.id,
          nickname: row.nickname,
          first_join: row.first_join,
          result: row.result,
          type: "NICKNAME",
        })),
        total,
        currentPage: page,
        totalPages: Math.ceil(total / pageSize),
        pageSize,
      };
    } catch (error) {
      console.error("유저 닉네임 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }

  async getGameDataByInstagram(query: {
    value: string;
    page: number;
  }): Promise<PaginatedResult<InstagramResult>> {
    try {
      const { value, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          i.display_name,
          i.username,
          i.phone_number,
          i.date_joined,
          COUNT(*) OVER() as total
        FROM phone_instagram_accounts i
        INNER JOIN phone_phones p ON i.phone_number = p.phone_number
        INNER JOIN vrp_users u ON p.id = u.id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE i.username LIKE ?
        ORDER BY u.id DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        `%${value}%`,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: rows.map(
          (row: RowDataPacket): InstagramResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: row.first_join,
            display_name: row.display_name,
            username: row.username,
            phone_number: row.phone_number,
            date_joined: row.date_joined,
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("인스타그램 계정 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }

  async getGameDataByCompany(query: {
    value: string;
    page: number;
  }): Promise<PaginatedResult<CompanyResult>> {
    const session = await auth();
    if (!session || !session.user) {
      return redirect("/");
    }

    if (!hasAccess(session.user.role, UserRole.INGAME_ADMIN)) {
      return redirect("/");
    }

    try {
      const { value, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      const dataQuery = `
        SELECT 
          c.id,
          c.name,
          c.capital,
          COUNT(*) OVER() as total
        FROM dokku_company c
        WHERE c.name LIKE ?
        ORDER BY c.capital DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        `%${value}%`,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: rows.map(
          (row: RowDataPacket): CompanyResult => ({
            id: row.id,
            name: row.name,
            capital: row.capital,
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("팩션 데이터 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }

  async updateCompanyCapital(
    companyId: number,
    capital: number
  ): Promise<ApiResponse<any>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        data: null,
        error: "로그인이 필요합니다.",
      };
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        data: null,
        error: "권한이 없습니다.",
      };
    }

    try {
      // 트랜잭션 사용하여 데이터 일관성 보장
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const query = `UPDATE dokku_company SET capital = ? WHERE id = ?`;
        await connection.execute(query, [capital, companyId]);

        await connection.commit();
        return { success: true, data: null, error: null };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("팩션 잔고 업데이트 에러:", error);
      return {
        success: false,
        data: null,
        error: "알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  async playerBan(
    userId: number,
    reason: string,
    duration: number,
    type: "ban" | "unban"
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    try {
      const response = await fetch(`${this.BASE_URL}/DokkuApi/playerBan`, {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          banreason: reason,
          bantime: duration,
          type: type,
          banadmin: session.user.nickname,
        }),
        headers: {
          "Content-Type": "application/json",
          key: this.API_KEY,
        },
        next: { revalidate: 0 }, // 밴은 캐시 사용하지 않음
      });

      const data = await response.json();
      return {
        success: data.success,
        data: data.success,
        error: data.success ? null : data.message,
      };
    } catch (error) {
      console.error("플레이어 밴 처리 에러:", error);
      return {
        success: false,
        data: null,
        error: "밴 처리 중 오류가 발생했습니다.",
      };
    }
  }

  async getGameDataByCompanyName(
    query: {
      value: string;
    } & PaginationParams
  ): Promise<PaginatedResult<CompanyResult>> {
    try {
      const { value, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      // LIKE 쿼리 최적화를 위한 인덱스 활용
      const dataQuery = `
        SELECT 
          c.id,
          c.name,
          c.capital,
          COUNT(*) OVER() as total
        FROM dokku_company c
        WHERE c.name LIKE ?
        ORDER BY c.capital DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        `%${value}%`,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: rows.map(
          (row: RowDataPacket): CompanyResult => ({
            id: row.id,
            name: row.name,
            capital: row.capital,
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("팩션 데이터 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  }
}

export const realtimeService = new RealtimeService();
