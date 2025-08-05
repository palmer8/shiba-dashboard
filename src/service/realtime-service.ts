import pool from "@/db/mysql";
import prisma from "@/db/prisma";
import { auth } from "@/lib/auth-config";
import {
  formatKoreanNumber,
  hasAccess,
  ROLE_HIERARCHY,
  parseCustomDateString,
} from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ApiResponse } from "@/types/global.dto";
import { reportService } from "@/service/report-service";
import {
  CompanyResult,
  InstagramResult,
  VehicleQueryResult,
} from "@/types/game";
import { redirect } from "next/navigation";
import { RealtimeGameUserData } from "@/types/user";
import { MemoResponse, UserMemo } from "@/types/realtime";
import { logService } from "./log-service";
import { boardService } from "@/service/board-service";
import { AttendanceRecordWithUser, SimplifiedUser } from "@/types/attendance";
import { DateRange } from "react-day-picker";

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
  private readonly DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
  private readonly GUILD_ID = process.env.GUILD_ID || "";

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
        cache: "no-store",
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
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

  private async getDiscordUserData(discordId: string) {
    try {
      // Discord 멤버 정보 조회
      const memberResponse = await fetch(
        `https://discord.com/api/v10/guilds/${this.GUILD_ID}/members/${discordId}`,
        {
          headers: {
            Authorization: `Bot ${this.DISCORD_BOT_TOKEN}`,
          },
        }
      );

      if (!memberResponse.ok) {
        return null;
      }

      const memberData = await memberResponse.json();

      // 역할 정보 조회
      const rolesResponse = await fetch(
        `https://discord.com/api/v10/guilds/${this.GUILD_ID}/roles`,
        {
          headers: {
            Authorization: `Bot ${this.DISCORD_BOT_TOKEN}`,
          },
        }
      );

      const roles = await rolesResponse.json();

      // 프로필 이미지 URL 생성 (수정된 부분)
      const avatarUrl = memberData.user.avatar
        ? `https://cdn.discordapp.com/avatars/${discordId}/${memberData.user.avatar}.webp?size=128`
        : null;

      return {
        username: memberData.user.username,
        globalName: memberData.user.global_name,
        nickname: memberData.nick,
        joinedAt: memberData.joined_at,
        avatarUrl,
        roles: memberData.roles
          .map((roleId: string) => {
            const role = roles.find((r: any) => r.id === roleId);
            return role ? role.name : null;
          })
          .filter(Boolean),
      };
    } catch (error) {
      console.error("Discord data fetch error:", error);
      return null;
    }
  }

  async getGameUserDataByUserId(
    userId: number
  ): Promise<ApiResponse<RealtimeGameUserData>> {
    const session = await auth();
    if (!session || !session.user) return redirect("/login");

    try {
      // 첫 번째 쿼리: 기본 사용자 데이터 가져오기
      const userDataQuery = `
        SELECT
          n.code as newbie_code,
          COALESCE(w.count, 0) as warning_count,
          p.phone_number,
          p.pin,
          -- discord: 접두어를 포함한 전체 identifier 가져오기
          (SELECT identifier FROM vrp_user_ids WHERE user_id = ? AND identifier LIKE 'discord:%' LIMIT 1) as discord_identifier,
          c.user_id as chunobot_user_id,
          c.adminName as chunobot_admin_name,
          c.reason as chunobot_reason,
          c.time as chunobot_time,
          e.emoji as emoji
        FROM (SELECT ? as user_id) as u
        LEFT JOIN dokku_newbie n ON n.user_id = u.user_id
        LEFT JOIN dokku_warning w ON w.user_id = u.user_id
        LEFT JOIN phone_phones p ON p.id = u.user_id
        LEFT JOIN dokku_chunobot c ON c.user_id = u.user_id
        LEFT JOIN dokku_coupleemojis e ON e.user_id = u.user_id
      `;

      const [[dbUserData]] = await pool.execute<RowDataPacket[]>(
        userDataQuery,
        [userId, userId] // user_id 바인딩 두 번 필요
      );

      // 두 번째 쿼리: 유저 메모 모두 가져오기
      const userMemoQuery = `
        SELECT
          m.user_id as memo_user_id,
          m.adminName as memo_admin_name,
          m.text as memo_text,
          m.time as memo_time
        FROM dokku_usermemo m
        WHERE m.user_id = ?
      `;

      const [memos] = await pool.execute<RowDataPacket[]>(userMemoQuery, [
        userId,
      ]);

      // 게임 데이터 가져오기
      const gameDataApiResponse = await this.fetchWithRetry<any>(
        "/DokkuApi/getPlayerData",
        {
          method: "POST",
          body: JSON.stringify({ user_id: userId }),
        }
      );

      // 에러 처리 개선
      if (gameDataApiResponse.error) {
        return {
          success: false,
          data: null,
          error:
            gameDataApiResponse.message ||
            "게임 데이터 조회 중 오류가 발생했습니다.",
        };
      }

      // 인시던트 리포트 가져오기
      const incidentReports =
        await reportService.getIncidentReportsByTargetUserId(userId);

      // Discord 데이터 추가
      let discordData = null;
      const discordIdentifier = dbUserData?.discord_identifier;
      const discordIdFromDb = discordIdentifier?.replace("discord:", "");

      if (discordIdFromDb) {
        discordData = await this.getDiscordUserData(discordIdFromDb);
      }

      // 하드밴 여부 조회 (user_id만 비교)
      let isIdBan = false;
      const [idBanRows] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM dokku_hwidban WHERE user_id = ? LIMIT 1`,
        [userId]
      );
      isIdBan = idBanRows.length > 0;


      // 데이터 통합
      const enrichedData: RealtimeGameUserData = {
        ...(gameDataApiResponse as Omit<
          RealtimeGameUserData,
          "discordId" | "discordData"
        >), // API 응답 타입 캐스팅 (주의 필요)
        newbieCode: dbUserData?.newbie_code ?? null,
        warningCount: dbUserData?.warning_count ?? 0,
        incidentReports: incidentReports.success
          ? incidentReports.data.records
          : [],
        lbPhoneNumber: dbUserData?.phone_number ?? null,
        lbPhonePin: dbUserData?.pin ?? null,
        discordId: discordIdentifier ?? null, // DB에서 가져온 identifier (접두어 포함)
        discordData: discordData, // API 조회 결과
        memos:
          memos.length > 0
            ? memos.map((memo) => ({
                user_id: memo.memo_user_id,
                adminName: memo.memo_admin_name,
                text: memo.memo_text,
                time: memo.memo_time,
              }))
            : [],
        chunobot: dbUserData?.chunobot_user_id
          ? {
              user_id: dbUserData.chunobot_user_id,
              adminName: dbUserData.chunobot_admin_name,
              reason: dbUserData.chunobot_reason,
              time: dbUserData.chunobot_time,
            }
          : null,
        emoji: dbUserData?.emoji ?? null,
        isIdBan,
        skinId: gameDataApiResponse.skinid,
      };

      // 로그 작성은 성공 시 한 번만
      if (enrichedData.last_nickname) {
        await logService.writeAdminLog(
          `${enrichedData.last_nickname}(${userId}) 유저 조회`
        );
      }

      return {
        success: true,
        data: enrichedData,
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
    await logService.writeAdminLog(`그룹 이름으로 그룹 조회 : ${groupName}`);

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

      await logService.writeAdminLog(
        `아이템 ${itemId} 보유량 ${value}개 ${condition} 데이터 조회 (${page}페이지)`
      );

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

      await logService.writeAdminLog(`차량 번호 조회 ${value} (${page}페이지)`);

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

      await logService.writeAdminLog(
        `재화 ${creditType} ${value}  ${condition} 데이터 조회 (${page}페이지)`
      );

      return {
        data: rows.map(
          (row: RowDataPacket): BaseQueryResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: row.first_join,
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

      await logService.writeAdminLog(
        `${
          moneyType === "WALLET" ? "현금" : "계좌"
        } ${value}원 ${condition} 데이터 조회 (${page}페이지)`
      );

      return {
        data: rows.map(
          (row: RowDataPacket): BaseQueryResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: row.first_join,
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

      await logService.writeAdminLog(
        `마일리지 ${value} ${condition} 데이터 조회 (${page}페이지)`
      );

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

      await logService.writeAdminLog(
        `${
          cashType === "CURRENT_CASH" ? "현재 캐시" : "누적 캐시"
        } ${value} ${condition} 데이터 조회 (${page}페이지)`
      );

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

        await logService.writeAdminLog(`${userId} 스킨 제거`);

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

      await logService.writeAdminLog(
        `인스타그램 ${value} 계정 조회 (${page}페이지)`
      );

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

      await logService.writeAdminLog(
        `팩션 공동 잔고 ${value} 데이터 조회 (${page}페이지)`
      );

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
        await logService.writeAdminLog(
          `팩션 공동 잔고 ${companyId} ${capital}원 업데이트`
        );
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
    duration: string,
    type: "ban" | "unban"
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        data: null,
      };
    }

    if (type === "ban" && duration === "-1") {
      duration = "영구정지";
    }

    if (
      type === "unban" &&
      !hasAccess(session.user.role, UserRole.INGAME_ADMIN)
    ) {
      return {
        success: false,
        data: null,
        error: "권한이 존재하지 않습니다",
      };
    }

    try {
      // 밴 처리
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
        next: { revalidate: 0 },
      });

      const data = await response.json();

      // 밴 해제 시 메모 자동 생성/수정
      if (type === "unban" && data.success) {
        await this.createMemo(userId, session.user.nickname, reason);
      }

      if (type === "ban") {
        await logService.writeAdminLog(
          `${userId} 플레이어 정지 ${duration} (${reason})`
        );
      } else {
        await logService.writeAdminLog(
          `${userId} 플레이어 정지 해제 (${reason})`
        );
      }

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

  async createMemo(
    userId: number,
    adminName: string,
    text: string
  ): Promise<MemoResponse> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        data: null,
        error: "로그인이 필요합니다.",
      };
    }

    try {
      // 이제 기존 메모 체크가 필요 없음 (항상 새로 생성)
      const insertQuery = `
        INSERT INTO dokku_usermemo (user_id, adminName, text, time) 
        VALUES (?, ?, ?, NOW())
      `;
      await pool.execute(insertQuery, [userId, adminName, text]);

      await logService.writeAdminLog(`${userId} 플레이어 메모 생성`);

      return {
        success: true,
        data: null,
        error: null,
      };
    } catch (error) {
      console.error("메모 처리 중 오류:", error);
      return {
        success: false,
        data: null,
        error: "메모 처리 중 오류가 발생했습니다.",
      };
    }
  }

  async updateMemo(originData: UserMemo, text: string): Promise<MemoResponse> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        data: null,
        error: "로그인이 필요합니다.",
      };
    }

    try {
      const query = `
        UPDATE dokku_usermemo 
        SET text = ?, adminName = ?
        WHERE user_id = ? 
          AND adminName = ? 
          AND text = ?
          AND time = ?
      `;

      const [result] = await pool.execute(query, [
        text,
        session.user.nickname,
        originData.user_id,
        originData.adminName,
        originData.text,
        originData.time,
      ]);

      await logService.writeAdminLog(`${originData.user_id} 메모 수정`);

      return {
        success: true,
        data: null,
        error: null,
      };
    } catch (error) {
      console.error("메모 수정 중 오류:", error);
      return {
        success: false,
        data: null,
        error: "메모 수정 중 오류가 발생했습니다.",
      };
    }
  }

  async getMemoByUserId(userId: number): Promise<UserMemo | null> {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    try {
      const query = `SELECT * FROM dokku_usermemo WHERE user_id = ?`;
      const [rows] = await pool.execute<RowDataPacket[]>(query, [userId]);

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as UserMemo;
    } catch (error) {
      console.error("메모 조회 중 오류:", error);
      throw new Error("메모 조회 중 오류가 발생했습니다.");
    }
  }

  async deleteMemo(memo: UserMemo) {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        data: null,
        error: "로그인이 필요합니다.",
      };
    }

    try {
      const query = `
        DELETE FROM dokku_usermemo 
        WHERE user_id = ? 
          AND adminName = ? 
          AND text = ?
          AND time = ?
      `;

      const [result] = await pool.execute(query, [
        memo.user_id,
        memo.adminName,
        memo.text,
        memo.time,
      ]);

      await logService.writeAdminLog(`${memo.user_id} 메모 삭제`);

      const deleteResult = result as { affectedRows: number };
      if (deleteResult.affectedRows === 0) {
        return {
          success: false,
          data: null,
          error: "삭제할 메모를 찾을 수 없습니다.",
        };
      }

      return {
        success: true,
        data: null,
        error: null,
      };
    } catch (error) {
      console.error("메모 삭제 중 오류:", error);
      return {
        success: false,
        data: null,
        error: "메모 삭제 중 오류가 발생했습니다.",
      };
    }
  }

  async createChunobot(
    userId: number,
    adminName: string,
    reason: string
  ): Promise<ApiResponse<null>> {
    try {
      const query = `
        REPLACE INTO dokku_chunobot (user_id, adminName, reason, time) 
        VALUES (?, ?, ?, NOW())
      `;
      await pool.execute(query, [userId, adminName, reason]);
      await logService.writeAdminLog(`${userId} 추노 알림 등록`);
      return { success: true, data: null, error: null };
    } catch (error) {
      console.error("추노 알림 등록 중 오류:", error);
      return {
        success: false,
        data: null,
        error: "추노 알림 등록 중 오류가 발생했습니다.",
      };
    }
  }

  async updateChunobot(
    userId: number,
    reason: string
  ): Promise<ApiResponse<null>> {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          data: null,
          error: "로그인이 필요합니다.",
        };
      }
      const query = `
        UPDATE dokku_chunobot 
        SET reason = ?, adminName = ?, time = NOW()
        WHERE user_id = ?
      `;
      await pool.execute(query, [reason, session.user.nickname, userId]);
      await logService.writeAdminLog(`${userId} 추노 알림 수정`);
      return { success: true, data: null, error: null };
    } catch (error) {
      console.error("추노 알림 수정 중 오류:", error);
      return {
        success: false,
        data: null,
        error: "추노 알림 수정 중 오류가 발생했습니다.",
      };
    }
  }

  async deleteChunobot(userId: number): Promise<ApiResponse<null>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        data: null,
        error: "로그인이 필요합니다.",
      };
    }
    try {
      const query = `DELETE FROM dokku_chunobot WHERE user_id = ?`;
      await pool.execute(query, [userId]);
      await logService.writeAdminLog(`${userId} 추노 알림 삭제`);
      return { success: true, data: null, error: null };
    } catch (error) {
      console.error("추노봇 삭제 중 오류:", error);
      return {
        success: false,
        data: null,
        error: "추노봇 삭제 중 오류가 발생했습니다.",
      };
    }
  }

  async getGameDataByIP(query: {
    value: string;
    page?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const page = query.page || 1;
      const limit = 50;
      const offset = (page - 1) * limit;

      const dataQuery = `
        SELECT 
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,          ui.first_join,
          SUBSTRING_INDEX(u.last_login, ' ', 1) as result,
          ui.first_join as first_join,
          COUNT(*) OVER() as total
        FROM vrp_users u
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE SUBSTRING_INDEX(u.last_login, ' ', 1) LIKE ?
        ORDER BY u.last_login DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        `%${query.value}%`,
        limit,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      await logService.writeAdminLog(`IP 조회 ${query.value} (${page}페이지)`);

      return {
        success: true,
        data: {
          records: rows.map((row) => ({
            id: row.id,
            nickname: row.nickname,
            result: row.result,
            first_join: row.first_join,
          })),
          metadata: {
            total,
            page,
            totalPages,
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("IP 주소 조회 에러:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했습니다.",
      };
    }
  }

  async updateJail(
    userId: number,
    time: number,
    reason: string,
    isAdmin: boolean
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        data: null,
      };
    }

    try {
      const response = await fetch(`${this.BASE_URL}/DokkuApi/updateJail`, {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          isAdmin,
          time,
          reason,
          adminName: session.user.nickname,
        }),
        headers: {
          "Content-Type": "application/json",
          key: this.API_KEY,
        },
      });

      const data = await response.json();

      if (data.success) {
        await logService.writeAdminLog(
          `${userId} 플레이어 ${
            time === 0 ? "구금 해제" : `${time}분 구금`
          } (${reason})`
        );
      }

      return {
        success: data.success,
        data: data.success,
        error: data.success ? null : "구금 처리 중 오류가 발생했습니다.",
      };
    } catch (error) {
      console.error("구금 처리 에러:", error);
      return {
        success: false,
        data: null,
        error: "구금 처리 중 오류가 발생했습니다.",
      };
    }
  }

  async getRecentBoards() {
    try {
      const result = await boardService.getRecentBoards();
      return result;
    } catch (error) {
      console.error("Recent boards fetch error:", error);
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

  async getOnlinePlayers(): Promise<
    ApiResponse<{ users: Array<{ user_id: number; name: string }> }>
  > {
    try {
      const response = await this.fetchWithRetry<{
        users?: Array<{ user_id: number; name: string }>; // users를 optional로 변경
      }>("/DokkuApi/getOnlinePlayers", { method: "POST" });

      // response.users가 존재하고 배열인지 확인
      if (response && Array.isArray(response.users)) {
        // user_id 기준으로 오름차순 정렬
        const sortedUsers = response.users.sort(
          (a, b) => a.user_id - b.user_id
        );
        return {
          success: true,
          data: { users: sortedUsers },
          error: null,
        };
      } else {
        // users가 없거나 배열이 아닌 경우 (API 응답 문제 등)
        console.warn(
          "Online players fetch: response.users is missing or not an array",
          response
        );
        return {
          success: true, // 또는 false로 처리하고 에러 메시지를 명확히 할 수 있음
          data: { users: [] }, // 빈 배열 반환
          error: null, // 또는 "Failed to parse online players data"와 같은 에러 메시지 설정
        };
      }
    } catch (error) {
      console.error("Online players fetch error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "온라인 플레이어 목록을 가져오는데 실패했습니다.",
      };
    }
  }

  async reloadPlayerData(userId: number) {
    try {
      const response = await this.fetchWithRetry<{
        success: boolean;
        message: string;
        error: number;
      }>("/DokkuApi/reloadPlayerData", {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      });
      if (response.success) {
        await logService.writeAdminLog(`${userId} 플레이어 데이터 리로드`);
      }
      return {
        success: response.success,
        data: response.success
          ? `플레이어 ${userId}의 데이터가 성공적으로 리로드되었습니다.`
          : response.message,
        error: response.success
          ? null
          : response.message || "플레이어 데이터 리로드 실패",
      };
    } catch (error) {
      console.error("플레이어 데이터 재로드 에러:", error);
      return {
        success: false,
        data: null,
        error: "플레이어 데이터 재로드 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 사용자의 Discord ID (identifier)를 업데이트하거나 삽입(Upsert)합니다.
   * @param gameUserId 게임 유저 ID
   * @param newDiscordId 새로운 Discord 사용자 ID (숫자 문자열)
   */
  async updateUserDiscordId(
    gameUserId: number,
    newDiscordId: string
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "로그인이 필요합니다.", data: false };
    }

    if (!hasAccess(session.user.role, UserRole.INGAME_ADMIN)) {
      return { success: false, error: "권한이 없습니다.", data: false };
    }

    if (!/^\d+$/.test(newDiscordId)) {
      return {
        success: false,
        error: "잘못된 Discord ID 형식입니다.",
        data: false,
      };
    }

    const newIdentifier = `discord:${newDiscordId}`;

    try {
      // 1. gameUserId가 vrp_users 테이블에 존재하는지 먼저 확인 (선택적이지만 권장)
      const [userCheck] = await pool.execute<RowDataPacket[]>(
        `SELECT 1 FROM vrp_users WHERE id = ? LIMIT 1`,
        [gameUserId]
      );
      if (userCheck.length === 0) {
        return {
          success: false,
          error: "존재하지 않는 게임 유저 ID입니다.",
          data: false,
        };
      }

      // 2. Upsert 실행
      const connection = await pool.getConnection();
      try {
        // user_id가 PK 또는 UNIQUE 키라고 가정
        const query = `
          INSERT INTO vrp_user_ids (user_id, identifier)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE identifier = VALUES(identifier)
        `;
        const [result] = await connection.execute<ResultSetHeader>(query, [
          gameUserId,
          newIdentifier,
        ]);

        // result.affectedRows: 1 = insert, 2 = update (값이 변경됨), 1 = update (값이 동일함 - MySQL 버전 따라 다름)
        // result.warningStatus == 0 (or check warnings if needed)
        if (result.affectedRows >= 1) {
          await logService.writeAdminLog(
            `${session.user.nickname}가 사용자 ${gameUserId}의 Discord ID를 ${newDiscordId}(으)로 설정/변경`
          );
          // 데이터 변경이 있었으므로 캐시 무효화 또는 갱신 필요 시 추가
          // 예: revalidateTag(`user-${gameUserId}-data`);
          return { success: true, data: true, error: null };
        } else {
          // affectedRows가 0인 경우: ON DUPLICATE KEY UPDATE 조건에서 아무 변경도 없었거나 예상치 못한 오류
          console.warn(
            `Discord ID Upsert for user ${gameUserId} resulted in 0 affected rows.`
          );
          return {
            success: false,
            error:
              "Discord ID 설정/변경에 실패했습니다 (변경사항 없음 또는 오류).",
            data: false,
          };
        }
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Update/Insert Discord ID error:", error);
      // MySQL 에러 코드 확인 가능 (e.g., foreign key constraint violation)
      return {
        success: false,
        error: "Discord ID 설정/변경 중 DB 오류 발생",
        data: false,
      };
    }
  }

  async checkOnlinePlayer(userId: number) {
    const response = await this.fetchWithRetry<{ online: boolean }>(
      "/DokkuApi/getPlayerOnlineCheck",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      }
    );
    return response;
  }

  /**
   * SUPERMASTER 이상만 가능한 유저 고유번호 변경
   * 1차: last_login, 온라인 여부, 경고 메시지 반환
   * 2차(confirm=true): 외부 API 연동 및 실제 변경
   */
  async changeUserId(
    currentUserId: number,
    newUserId: number,
    confirm: boolean
  ): Promise<
    ApiResponse<{
      lastLoginDate: string | null;
      isCurrentUserOnline: boolean;
      changed?: boolean;
      isNewUserIdExists?: boolean; // <<< 추가: newUserId 존재 여부 플래그
    }>
  > {
    const session = await auth();
    if (!session?.user) {
      return { success: false, data: null, error: "로그인이 필요합니다." };
    }
    if (!hasAccess(session.user.role, UserRole.MASTER)) {
      return { success: false, data: null, error: "권한이 없습니다." };
    }
    // currentUserId, newUserId 존재 확인
    const [currentRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM vrp_users WHERE id = ? LIMIT 1`,
      [currentUserId]
    );
    if (currentRows.length === 0) {
      return {
        success: false,
        data: null,
        error: `기존 고유번호(${currentUserId})가 존재하지 않습니다.`,
      };
    }
    const [newRows] = await pool.execute<RowDataPacket[]>(
      `SELECT last_login FROM vrp_users WHERE id = ? LIMIT 1`,
      [newUserId]
    );

    const isNewUserIdExists = newRows.length > 0; // <<< 추가: 존재 여부 확인
    let lastLoginRaw: string | null = null;
    let lastLoginDate: Date | null = null;
    // (30일 기준) 마지막 접속 후 30일을 초과했는지 여부
    let isOver30Days = false;

    // <<< 수정 시작: isNewUserIdExists 체크 로직 추가
    if (isNewUserIdExists) {
      // newUserId가 존재할 때만 last_login 파싱 및 31일 체크
      lastLoginRaw = newRows[0].last_login as string | null;
      if (lastLoginRaw) {
        try {
          // <<< 수정: 정규식을 사용하여 날짜/시간 부분 추출
          const dateTimeMatch = lastLoginRaw.match(
            /(\d{2}:\d{2}:\d{2})\s(\d{2}\/\d{2}\/\d{4})/
          );
          if (dateTimeMatch && dateTimeMatch.length >= 3) {
            const timeStr = dateTimeMatch[1]; // "22:31:51"
            const dateStr = dateTimeMatch[2]; // "23/01/2025"
            // 추출된 문자열을 parseCustomDateString 함수에 전달
            lastLoginDate = parseCustomDateString(`${timeStr} ${dateStr}`);
          } else {
            // 매칭 실패 시 로그 남기고 null 처리
            console.warn(
              `Could not parse date/time from last_login: ${lastLoginRaw}`
            );
            lastLoginDate = null;
          }
          // <<< 수정 끝
        } catch (e) {
          console.error(`Error parsing last_login string: ${lastLoginRaw}`, e);
          lastLoginDate = null;
        }
      }
      if (lastLoginDate) {
        const now = new Date();
        const diff = now.getTime() - lastLoginDate.getTime();
        // 30일(2592000000ms) 초과 여부 계산
        isOver30Days = diff >= 30 * 24 * 60 * 60 * 1000;
      }
    }
    // <<< 수정 끝

    // currentUserId 온라인 여부
    const onlineResult = await this.checkOnlinePlayer(currentUserId);
    const isCurrentUserOnline = onlineResult?.online ?? false;

    // 1차: 경고 메시지/상태 반환
    if (!confirm) {
      let warningMsg: string | null = null;

      // =================== 강제 조건 체크 ===================
      if (isNewUserIdExists && !isOver30Days) {
        return {
          success: false,
          data: {
            lastLoginDate: lastLoginRaw,
            isCurrentUserOnline,
            changed: false,
            isNewUserIdExists,
          },
          error: `변경할 고유번호(${newUserId})의 마지막 접속일이 30일 이내이므로 변경할 수 없습니다.`,
        };
      }
      // =======================================================

      if (!isNewUserIdExists) {
        warningMsg = `변경할 고유번호(${newUserId})는 사용된 적이 없습니다.`;
        if (isCurrentUserOnline) {
          warningMsg += ` 현재 유저는 온라인 상태입니다.`;
        }
        warningMsg += ` 정말로 이 번호로 변경하시겠습니까?`;
      } else {
        warningMsg = `변경할 고유번호(${newUserId})의 마지막 접속일은 ${lastLoginRaw} (D+30 이후)입니다.`;
        if (isCurrentUserOnline) {
          warningMsg += ` 현재 유저는 온라인 상태입니다.`;
        }
        warningMsg += ` 정말로 고유번호를 변경하시겠습니까?`;
      }

      return {
        success: true,
        data: {
          lastLoginDate: lastLoginRaw,
          isCurrentUserOnline,
          changed: false,
          isNewUserIdExists,
        },
        error: warningMsg, // 경고/안내 메시지를 error 필드에 담아 전달
      };
    }

    // =================== 2차: 실제 변경 전 최종 서버사이드 조건 체크 ===================
    if (isNewUserIdExists && !isOver30Days) {
      return {
        success: false,
        data: {
          lastLoginDate: lastLoginRaw,
          isCurrentUserOnline,
          changed: false,
          isNewUserIdExists,
        },
        error: `변경할 고유번호(${newUserId})의 마지막 접속일이 30일 이내이므로 변경할 수 없습니다.`,
      };
    }
    // =================================================================================

    // 2차: 실제 변경(외부 API)
    try {
      const response = await fetch(
        `http://141.11.194.130:30120/DokkuApi/changeUserId`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", key: this.API_KEY },
          body: JSON.stringify({
            currentuserid: currentUserId,
            newuserid: newUserId,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        await logService.writeAdminLog(
          `${session.user.nickname}가 유저 고유번호를 ${currentUserId} → ${newUserId}로 변경 (2차 승인)`
        );
        return {
          success: true,
          data: {
            lastLoginDate: lastLoginRaw,
            isCurrentUserOnline,
            changed: true,
            isNewUserIdExists, // <<< 추가
          },
          error: null,
        };
      } else {
        return {
          success: false,
          data: {
            lastLoginDate: lastLoginRaw,
            isCurrentUserOnline,
            changed: false,
            isNewUserIdExists, // <<< 추가
          },
          error: result.message || "고유번호 변경에 실패했습니다.",
        };
      }
    } catch (error) {
      return {
        success: false,
        data: {
          lastLoginDate: lastLoginRaw,
          isCurrentUserOnline,
          changed: false,
          isNewUserIdExists, // <<< 추가
        },
        error:
          error instanceof Error
            ? error.message
            : "고유번호 변경 중 알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  /**
   * SUPERMASTER 이상만 가능한 유저 차량번호/계좌번호 변경
   * registration(차량번호), phone(계좌번호) 중 입력된 값만 수정
   * 자기 자신 제외 중복 체크, 성공/실패/중복 등 명확한 메시지 반환
   */
  async changeUserIdentity(
    userId: number,
    registration?: string,
    phone?: string
  ): Promise<
    ApiResponse<{ updatedRegistration?: string; updatedPhone?: string }>
  > {
    const session = await auth();
    if (!session?.user) {
      return { success: false, data: null, error: "로그인이 필요합니다." };
    }
    if (!hasAccess(session.user.role, UserRole.MASTER)) {
      return { success: false, data: null, error: "권한이 없습니다." };
    }
    // userId 존재 확인
    const [userRows] = await pool.execute<RowDataPacket[]>(
      `SELECT user_id FROM vrp_user_identities WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    // 중복 체크 및 업데이트 준비
    let updateFields: string[] = [];
    let updateValues: any[] = [];
    // 차량번호(registration) 중복 체크 및 준비
    if (registration && registration.trim() !== "") {
      const [regRows] = await pool.execute<RowDataPacket[]>(
        `SELECT user_id FROM vrp_user_identities WHERE registration = ? AND user_id != ? LIMIT 1`,
        [registration, userId]
      );
      if (regRows.length > 0) {
        return {
          success: false,
          data: null,
          error: `이미 사용 중인 차량번호입니다.`,
        };
      }
      updateFields.push("registration = ?");
      updateValues.push(registration);
    }
    // 계좌번호(phone) 중복 체크 및 준비
    if (phone && phone.trim() !== "") {
      const [phoneRows] = await pool.execute<RowDataPacket[]>(
        `SELECT user_id FROM vrp_user_identities WHERE phone = ? AND user_id != ? LIMIT 1`,
        [phone, userId]
      );
      if (phoneRows.length > 0) {
        return {
          success: false,
          data: null,
          error: `이미 사용 중인 계좌번호입니다.`,
        };
      }
      updateFields.push("phone = ?");
      updateValues.push(phone);
    }
    if (updateFields.length === 0) {
      return { success: false, data: null, error: "수정할 정보가 없습니다." };
    }
    // UPDATE 쿼리 실행
    try {
      const query = `UPDATE vrp_user_identities SET ${updateFields.join(
        ", "
      )} WHERE user_id = ?`;
      await pool.execute(query, [...updateValues, userId]);
      // 변경 로그 추가
      let changedFields: string[] = [];
      if (registration)
        changedFields.push(`차량번호를 ${registration}(으)로 변경`);
      if (phone) changedFields.push(`계좌번호를 ${phone}(으)로 변경`);
      await logService.writeAdminLog(
        `${session.user.nickname}(user_id=${userId}) ${changedFields.join(
          ", "
        )}`
      );
      return {
        success: true,
        data: {
          updatedRegistration: registration || undefined,
          updatedPhone: phone || undefined,
        },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "유저 정보 수정 중 알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  async getAttendanceRecordsForUser(
    userNumericId: number,
    dateRange: DateRange | undefined
  ): Promise<ApiResponse<AttendanceRecordWithUser[]>> {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        data: null,
        error: "권한이 없습니다. 로그인이 필요합니다.",
      };
    }

    if (!dateRange || !dateRange.from || !dateRange.to) {
      return {
        success: false,
        data: null,
        error: "날짜 범위가 올바르지 않습니다.",
      };
    }

    // 이전에 추가한 디버깅 로그는 제거합니다.

    const rangeStart = dateRange.from; // JS Date 객체 (UTC 시작 시간 유지)

    // rangeEnd를 dateRange.to 날짜의 UTC 기준 23:59:59.999로 설정
    const adjustedRangeEnd = new Date(dateRange.to);
    adjustedRangeEnd.setUTCHours(23, 59, 59, 999);

    try {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          userNumericId: userNumericId,
          AND: [
            { checkInTime: { lte: adjustedRangeEnd } }, // 조정된 rangeEnd 사용
            {
              OR: [
                { checkOutTime: { gte: rangeStart } },
                { checkOutTime: null },
              ],
            },
          ],
        },
        orderBy: {
          checkInTime: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              nickname: true,
              image: true,
              role: true,
              isPermissive: true,
            },
          },
        },
      });

      const formattedRecords: AttendanceRecordWithUser[] = records.map(
        (record) => {
          const { user, ...restOfRecord } = record;
          const simplifiedUser: SimplifiedUser = {
            id: user.id,
            userId: user.userId,
            nickname: user.nickname,
            image: user.image,
            role: user.role,
            isPermissive: user.isPermissive,
          };
          return {
            ...restOfRecord,
            userNumericId: user.userId, // 이 필드가 이미 AttendanceRecordWithUser에 있다면 유지, 없다면 user.userId로 채움
            user: simplifiedUser,
          };
        }
      );

      return {
        success: true,
        data: formattedRecords,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching attendance records for user:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "사용자 근태 기록 조회 중 알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  // 모든 사용자의 모든 근태 기록을 가져오는 메소드
  async getAttendanceRecordsWithUser(): Promise<
    ApiResponse<AttendanceRecordWithUser[]>
  > {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        data: null,
        error: "권한이 없습니다. 로그인이 필요합니다.",
      };
    }

    try {
      const records = await prisma.attendanceRecord.findMany({
        orderBy: {
          checkInTime: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              nickname: true,
              image: true,
              role: true,
              isPermissive: true,
            },
          },
        },
      });

      const formattedRecords: AttendanceRecordWithUser[] = records.map(
        (record) => {
          const { user, ...restOfRecord } = record;
          const simplifiedUser: SimplifiedUser = {
            id: user.id,
            userId: user.userId,
            nickname: user.nickname,
            image: user.image,
            role: user.role,
            isPermissive: user.isPermissive,
          };
          return {
            ...restOfRecord,
            userNumericId: user.userId,
            user: simplifiedUser,
          };
        }
      );
      await logService.writeAdminLog(
        `${session.user.nickname}님이 전체 근태 기록 조회`
      );
      return {
        success: true,
        data: formattedRecords,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching all attendance records:", error);
      await logService.writeAdminLog(
        `전체 근태 기록 조회 중 오류 발생: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "전체 근태 기록 조회 중 알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  // <<< 새로운 함수 추가 시작 >>>
  /**
   * 사용자의 경고 횟수를 직접 설정합니다 (Master 이상).
   * @param userId 대상 유저 ID
   * @param count 새로운 경고 횟수 (0-7)
   */
  async setWarningCount(
    userId: number,
    count: number
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "로그인이 필요합니다.", data: false };
    }

    // // 권한 확인 (Master 이상)
    // if (!hasAccess(session.user.role, UserRole.MASTER)) {
    //   return { success: false, error: "권한이 없습니다.", data: false };
    // }

    // 입력값 검증 (0-7)
    if (count < 0 || count > 7 || !Number.isInteger(count)) {
      return {
        success: false,
        error: "경고 횟수는 0에서 7 사이의 정수여야 합니다.",
        data: false,
      };
    }

    try {
      // UPSERT 쿼리 실행
      const query = `
        INSERT INTO dokku_warning (user_id, count)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE count = VALUES(count)
      `;
      const [result] = await pool.execute<ResultSetHeader>(query, [
        userId,
        count,
      ]);

      // 성공 로그 기록
      if (result.affectedRows > 0 || result.warningStatus === 0) {
        await logService.writeAdminLog(
          `${session.user.nickname}가 사용자 ${userId}의 경고 횟수를 ${count}(으)로 직접 설정`
        );
        return { success: true, data: true, error: null };
      } else {
        console.warn(
          `Warning count set for user ${userId} to ${count} resulted in 0 affected rows.`
        );
        return {
          success: false,
          error: "경고 횟수 설정에 실패했습니다.",
          data: false,
        };
      }
    } catch (error) {
      console.error("Set warning count error:", error);
      return {
        success: false,
        error: "경고 횟수 설정 중 DB 오류 발생",
        data: false,
      };
    }
  }
  // <<< 새로운 함수 추가 끝 >>>

  // 내 근태 정보(오늘 출근/퇴근 등) 반환
  async getMyTodayAttendance(): Promise<
    ApiResponse<AttendanceRecordWithUser | null>
  > {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, data: null, error: "로그인이 필요합니다." };
    }
    const userNumericId = session.user.userId;
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    const record = await prisma.attendanceRecord.findFirst({
      where: {
        userNumericId,
        checkInTime: { gte: start, lte: end },
      },
      orderBy: { checkInTime: "desc" },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            nickname: true,
            image: true,
            role: true,
            isPermissive: true,
          },
        },
      },
    });

    if (!record) return { success: true, data: null, error: null };

    return {
      success: true,
      data: {
        ...record,
        userNumericId: record.user.userId,
        user: {
          id: record.user.id,
          userId: record.user.userId,
          nickname: record.user.nickname,
          image: record.user.image,
          role: record.user.role,
          isPermissive: record.user.isPermissive,
        },
      },
      error: null,
    };
  }

  // 내 근태 기록 리스트(최근 2주 등) 반환
  async getMyAttendanceRecords(): Promise<
    ApiResponse<AttendanceRecordWithUser[]>
  > {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, data: [], error: "로그인이 필요합니다." };
    }
    const userNumericId = session.user.userId;
    const today = new Date();
    const from = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 13,
      0,
      0,
      0,
      0
    ); // 최근 2주(14일)
    const to = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    const records = await prisma.attendanceRecord.findMany({
      where: {
        userNumericId,
        checkInTime: { gte: from, lte: to },
      },
      orderBy: { checkInTime: "desc" },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            nickname: true,
            image: true,
            role: true,
            isPermissive: true,
          },
        },
      },
    });

    const formattedRecords: AttendanceRecordWithUser[] = records.map(
      (record) => ({
        ...record,
        userNumericId: record.user.userId,
        user: {
          id: record.user.id,
          userId: record.user.userId,
          nickname: record.user.nickname,
          image: record.user.image,
          role: record.user.role,
          isPermissive: record.user.isPermissive,
        },
      })
    );

    return {
      success: true,
      data: formattedRecords,
      error: null,
    };
  }

  async getThisWeekAttendanceRecords(): Promise<
    ApiResponse<AttendanceRecordWithUser[]>
  > {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "인증이 필요합니다",
        data: null,
      };
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      return {
        success: false,
        error: "권한이 없습니다",
        data: null,
      };
    }

    try {
      // 이번주 시작과 끝 계산 (월요일 시작)
      const now = new Date();
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // 월요일로 설정
      startOfThisWeek.setHours(0, 0, 0, 0);

      const endOfThisWeek = new Date(startOfThisWeek);
      endOfThisWeek.setDate(startOfThisWeek.getDate() + 6); // 일요일
      endOfThisWeek.setHours(23, 59, 59, 999);

      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
          checkInTime: {
            gte: startOfThisWeek,
            lte: endOfThisWeek,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              image: true,
              role: true,
              userId: true,
              isPermissive: true,
            },
          },
        },
        orderBy: {
          checkInTime: "desc",
        },
      });

      const recordsWithUser: AttendanceRecordWithUser[] = attendanceRecords.map(
        (record) => ({
          id: record.id,
          userNumericId: record.userNumericId,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          user: {
            id: record.user.id,
            nickname: record.user.nickname,
            image: record.user.image,
            role: record.user.role,
            userId: record.user.userId,
            isPermissive: record.user.isPermissive,
          },
        })
      );

      return {
        success: true,
        data: recordsWithUser,
        error: null,
      };
    } catch (error) {
      console.error("이번주 근태 기록 조회 에러:", error);
      return {
        success: false,
        error: "이번주 근태 기록 조회 중 오류가 발생했습니다",
        data: null,
      };
    }
  }

  async getGameDataBySkinId(
    query: {
      value: string; // 정확히 일치할 스킨ID
    } & PaginationParams
  ): Promise<PaginatedResult<BaseQueryResult>> {
    try {
      const { value, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      const dataQuery = `
        SELECT
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) AS nickname,
          ui.first_join,
          ud.skinitem_skinid AS result,
          'SKIN' AS type,
          COUNT(*) OVER() AS total
        FROM vrp_user_data ud
        JOIN vrp_users u ON u.id = ud.user_id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE ud.skinitem_skinid = ?
        ORDER BY u.id ASC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        value,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      await logService.writeAdminLog(`스킨 ID '${value}' 검색 (${page}페이지)`);

      return {
        data: rows.map((row: RowDataPacket): BaseQueryResult => ({
          id: row.id,
          nickname: row.nickname,
          first_join: row.first_join,
          result: row.result,
          type: 'SKIN',
        })),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error('getGameDataBySkinId error:', error);
      return {
        data: [],
        total: 0,
        currentPage: query.page,
        totalPages: 0,
        pageSize: 50,
      };
    }
  }

  async getGameDataByVehicle(
    query: {
      value: string; // 검색할 차량 모델명
    } & PaginationParams
  ): Promise<PaginatedResult<VehicleQueryResult>> {
    try {
      const { value, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      const dataQuery = `
        SELECT
          uv.user_id as id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          uv.vehicle,
          uv.vehicle_plate,
          COUNT(*) OVER() as total
        FROM vrp_user_vehicles uv
        INNER JOIN vrp_users u ON u.id = uv.user_id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE uv.vehicle LIKE ?
        ORDER BY uv.user_id ASC, uv.vehicle ASC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        `%${value}%`,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      await logService.writeAdminLog(
        `차량 모델 '${value}' 검색 (${page}페이지)`
      );

      return {
        data: rows.map(
          (row: RowDataPacket): VehicleQueryResult => ({
            id: row.id,
            nickname: row.nickname,
            first_join: row.first_join,
            vehicle: row.vehicle,
            vehicle_plate: row.vehicle_plate,
          })
        ),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error("차량 데이터 조회 에러:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "차량 데이터 조회 중 알 수 없는 오류가 발생했습니다."
      );
    }
  }

  // vrp_user_ids 관련 함수들
  async getUserIds(userId: number): Promise<ApiResponse<Array<{
    identifier: string;
    user_id: number;
    banned: number | null;
  }>>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "인증이 필요합니다",
        data: null,
      };
    }

    try {
      const query = `
        SELECT identifier, user_id, banned
        FROM vrp_user_ids
        WHERE user_id = ?
        ORDER BY identifier ASC
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(query, [userId]);

      await logService.writeAdminLog(`유저 ID 목록 조회: ${userId}`);

      return {
        success: true,
        data: rows as Array<{
          identifier: string;
          user_id: number;
          banned: number | null;
        }>,
        error: null,
      };
    } catch (error) {
      console.error("유저 ID 목록 조회 에러:", error);
      return {
        success: false,
        error: "유저 ID 목록 조회 중 오류가 발생했습니다",
        data: null,
      };
    }
  }

  async updateUserIdBanned(
    identifier: string,
    banned: number
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "인증이 필요합니다",
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
      const query = `
        UPDATE vrp_user_ids
        SET banned = ?
        WHERE identifier = ?
      `;

      const [result] = await pool.execute<ResultSetHeader>(query, [banned, identifier]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          error: "해당 식별자를 찾을 수 없습니다",
          data: null,
        };
      }

      await logService.writeAdminLog(`유저 ID 상태 변경: ${identifier} -> banned: ${banned}`);

      return {
        success: true,
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("유저 ID 상태 변경 에러:", error);
      return {
        success: false,
        error: "유저 ID 상태 변경 중 오류가 발생했습니다",
        data: null,
      };
    }
  }

  async deleteUserIds(
    identifiers: string[],
    userId: number
  ): Promise<ApiResponse<{ deletedCount: number }>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "인증이 필요합니다",
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
      // 현재 해당 유저의 총 ID 개수 확인
      const countQuery = `SELECT COUNT(*) as total FROM vrp_user_ids WHERE user_id = ?`;
      const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, [userId]);
      const totalCount = countResult[0].total;

      const placeholders = identifiers.map(() => '?').join(',');
      const query = `
        DELETE FROM vrp_user_ids
        WHERE identifier IN (${placeholders}) AND user_id = ?
      `;

      const [result] = await pool.execute<ResultSetHeader>(query, [...identifiers, userId]);

      await logService.writeAdminLog(`유저 ID 삭제: ${identifiers.join(', ')} (${result.affectedRows}개)`);

      return {
        success: true,
        data: { deletedCount: result.affectedRows },
        error: null,
      };
    } catch (error) {
      console.error("유저 ID 삭제 에러:", error);
      return {
        success: false,
        error: "유저 ID 삭제 중 오류가 발생했습니다",
        data: null,
      };
    }
  }

  async updateUserIdentifier(
    oldIdentifier: string,
    newIdentifier: string
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "인증이 필요합니다",
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
      // 새로운 식별자가 이미 존재하는지 확인
      const checkQuery = `SELECT COUNT(*) as count FROM vrp_user_ids WHERE identifier = ?`;
      const [checkResult] = await pool.execute<RowDataPacket[]>(checkQuery, [newIdentifier]);
      
      if (checkResult[0].count > 0) {
        return {
          success: false,
          error: "이미 존재하는 식별자입니다",
          data: null,
        };
      }

      const query = `
        UPDATE vrp_user_ids
        SET identifier = ?
        WHERE identifier = ?
      `;

      const [result] = await pool.execute<ResultSetHeader>(query, [newIdentifier, oldIdentifier]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          error: "해당 식별자를 찾을 수 없습니다",
          data: null,
        };
      }

      await logService.writeAdminLog(`유저 ID 수정: ${oldIdentifier} -> ${newIdentifier}`);

      return {
        success: true,
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("유저 ID 수정 에러:", error);
      return {
        success: false,
        error: "유저 ID 수정 중 오류가 발생했습니다",
        data: null,
      };
    }
  }

  async addUserIdentifier(
    userId: number,
    identifier: string
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "인증이 필요합니다",
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
      // 식별자가 이미 존재하는지 확인
      const checkQuery = `SELECT COUNT(*) as count FROM vrp_user_ids WHERE identifier = ?`;
      const [checkResult] = await pool.execute<RowDataPacket[]>(checkQuery, [identifier]);
      
      if (checkResult[0].count > 0) {
        return {
          success: false,
          error: "이미 존재하는 식별자입니다",
          data: null,
        };
      }

      const query = `
        INSERT INTO vrp_user_ids (user_id, identifier, banned)
        VALUES (?, ?, 0)
      `;

      const [result] = await pool.execute<ResultSetHeader>(query, [userId, identifier]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          error: "식별자 추가에 실패했습니다",
          data: null,
        };
      }

      await logService.writeAdminLog(`유저 ID 추가: 유저 ${userId}에게 ${identifier} 추가`);

      return {
        success: true,
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("유저 ID 추가 에러:", error);
      return {
        success: false,
        error: "유저 ID 추가 중 오류가 발생했습니다",
        data: null,
      };
    }
  }

  async getGameDataByDiscordId(query: {
    value: string;
    page: number;
  }): Promise<PaginatedResult<BaseQueryResult>> {
    try {
      const { value, page } = query;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      const dataQuery = `
        SELECT
          u.id,
          SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname,
          ui.first_join,
          v.identifier AS result,
          COUNT(*) OVER() AS total
        FROM vrp_user_ids v
        JOIN vrp_users u ON v.user_id = u.id
        LEFT JOIN vrp_user_identities ui ON ui.user_id = u.id
        WHERE v.identifier = CONCAT('discord:', ?)
        ORDER BY u.id DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [
        value,
        pageSize,
        offset,
      ]);

      const total = rows[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      await logService.writeAdminLog(`디스코드 ID ${value} 조회 (${page}페이지)`);

      return {
        data: rows.map((row: RowDataPacket): BaseQueryResult => ({
          id: row.id,
          nickname: row.nickname,
          first_join: row.first_join,
          result: row.result,
          type: 'DISCORD',
        })),
        total,
        currentPage: page,
        totalPages,
        pageSize,
      };
    } catch (error) {
      console.error('디스코드 ID 조회 에러:', error);
      throw new Error(
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      );
    }
  }
}

export const realtimeService = new RealtimeService();
