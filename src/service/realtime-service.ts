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

  private async fetchWithTimeout<T>(
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
        next: { revalidate: 30 },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // 아이템 데이터 조회
  async getGameUserDataByUserId(userId: number) {
    try {
      // MySQL 쿼리와 API 요청을 병렬로 실행
      const [
        userDataResponse,
        [newbieResults],
        [warningResults],
        incidentReports,
        [lbphoneResults],
        [discordIdentifier],
      ] = await Promise.all([
        fetch(`${process.env.PRIVATE_API_URL}/DokkuApi/getPlayerData`, {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({ user_id: userId }),
          headers: {
            "Content-Type": "application/json",
            key: process.env.PRIVATE_API_KEY || "",
          },
        }).then((res) => res.json()),

        // 뉴비코드 조회
        pool.execute<RowDataPacket[]>(
          "SELECT code FROM dokku_newbie WHERE user_id = ?",
          [userId]
        ),

        // 경고 횟수 조회
        pool.execute<RowDataPacket[]>(
          "SELECT count FROM dokku_warning WHERE user_id = ?",
          [userId]
        ),

        // 사건 처리 보고서 조회
        reportService.getIncidentReportsByTargetUserId(userId),

        //lb폰 조회
        pool.execute<RowDataPacket[]>(
          "SELECT phone_number, pin FROM phone_phones WHERE id = ?",
          [userId]
        ),

        // Discord 식별자 조회 추가
        pool.execute<RowDataPacket[]>(
          "SELECT identifier FROM vrp_user_ids WHERE user_id = ? AND identifier LIKE 'discord:%' LIMIT 1",
          [userId]
        ),
      ]);

      if (userDataResponse.error) {
        return {
          success: false,
          message: "유저 데이터 조회 실패",
          data: null,
          error: userDataResponse.error,
        };
      }

      // API 응답에 MySQL 데이터 추가
      const enrichedData = {
        ...userDataResponse,
        newbieCode: newbieResults?.[0]?.code ?? null,
        warningCount: warningResults?.[0]?.count ?? 0,
        incidentReports: incidentReports.success
          ? incidentReports.data.records
          : [],
        lbPhoneNumber: lbphoneResults?.[0]?.phone_number ?? null,
        lbPhonePin: lbphoneResults?.[0]?.pin ?? null,
        discordId:
          discordIdentifier?.[0]?.identifier?.replace("discord:", "") ?? null,
      };

      return {
        success: true,
        message: "유저 데이터 조회 성공",
        data: enrichedData,
        error: null,
      };
    } catch (error) {
      console.error("getGameUserDataByUserId error:", error);
      return {
        success: false,
        message: "유저 데이터 조회 실패",
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

      // 데이터 조회 쿼리
      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          CAST(JSON_EXTRACT(ud.inventory, ?) AS SIGNED) as amount
        FROM vrp_user_data ud
        INNER JOIN vrp_users u ON u.id = ud.user_id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE JSON_EXTRACT(ud.inventory, ?) IS NOT NULL
        AND CAST(JSON_EXTRACT(ud.inventory, ?) AS SIGNED) ${operator} ?
        ORDER BY amount DESC
        LIMIT ? OFFSET ?
      `;

      // 전체 개수 조회 쿼리
      const countQuery = `
        SELECT COUNT(*) as total
        FROM vrp_user_data ud
        INNER JOIN vrp_users u ON u.id = ud.user_id
        WHERE JSON_EXTRACT(ud.inventory, ?) IS NOT NULL
        AND CAST(JSON_EXTRACT(ud.inventory, ?) AS SIGNED) ${operator} ?
      `;

      const amountPath = `$.${itemId}.amount`;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        amountPath,
        amountPath,
        amountPath,
        value,
        pageSize,
        offset,
      ]);

      const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, [
        amountPath,
        amountPath,
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

      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          ui.registration as amount
        FROM vrp_user_identities ui
        INNER JOIN vrp_users u ON u.id = ui.user_id
        WHERE ui.registration = ?
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM vrp_user_identities
        WHERE registration = ?
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

      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          um.${creditField} as amount
        FROM vrp_user_moneys um
        INNER JOIN vrp_users u ON u.id = um.user_id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE um.${creditField} ${operator} ?
        ORDER BY amount DESC
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM vrp_user_moneys
        WHERE ${creditField} ${operator} ?
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
      const data = await this.fetchWithTimeout<{ playerNum: number }>(
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
      const data = await this.fetchWithTimeout<{
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
    if (!session || !session.user) {
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
      const query = `UPDATE dokku_company SET capital = ? WHERE id = ?`;
      const [result] = await pool.execute<RowDataPacket[]>(query, [
        capital,
        companyId,
      ]);
      return {
        success: true,
        data: null,
        error: null,
      };
    } catch (error) {
      console.error("팩션 잔고 업데이트 에러:", error);
      return {
        success: false,
        data: null,
        error: "알 수 없는 오류가 발생했습니다.",
      };
    }
  }
}

export const realtimeService = new RealtimeService();
