import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import pool from "@/db/mysql";
import prisma from "@/db/prisma";
import { logService } from "./log-service";
import {
  PersonalMail,
  GroupMailReserve,
  PersonalMailList,
  GroupMailReserveList,
  GroupMailReserveLogList,
  PersonalMailFilter,
  GroupMailReserveFilter,
  GroupMailReserveLogFilter,
} from "@/types/mail";
import {
  PersonalMailCreateValues,
  GroupMailReserveCreateValues,
  GroupMailReserveEditValues,
} from "@/lib/validations/mail"; 
import { RowDataPacket, ResultSetHeader } from "mysql2";

// 아이템 이름 매핑 유틸리티 함수
function mapItemIdsToNames(
  items: Record<string, number>, 
  itemNameMap: Map<string, string>
): Record<string, { name: string; amount: number }> {
  const mapped: Record<string, { name: string; amount: number }> = {};
  Object.entries(items).forEach(([itemId, amount]) => {
    mapped[itemId] = {
      name: itemNameMap.get(itemId) || itemId,
        amount: amount,
      };
    });
  return mapped;
}

// 개인 우편 목록 조회
export async function getPersonalMails(
  page: number = 0,
  filter: PersonalMailFilter
): Promise<PersonalMailList> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    const limit = 50;
    const offset = page * limit;

    // 필터 조건 구성
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (filter.userId) {
      whereClause += " AND m.user_id = ?";
      params.push(filter.userId);
    }

    if (filter.used !== undefined) {
      whereClause += " AND m.used = ?";
      params.push(filter.used ? 1 : 0);
    }

    if (filter.startDate && filter.endDate) {
      const filterStartDate = new Date(filter.startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      
      const filterEndDate = new Date(filter.endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      
      whereClause += " AND m.created_at >= ? AND m.created_at <= ?";
      params.push(filterStartDate, filterEndDate);
    }

    // 총 개수 조회와 데이터 조회를 병렬로 실행
    const countQuery = `SELECT COUNT(*) as total FROM dokku_mail m ${whereClause}`;
    const dataQuery = `
      SELECT 
        m.*,
        SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname
      FROM dokku_mail m
      LEFT JOIN vrp_users u ON m.user_id = u.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [[countResult], [rows]] = await Promise.all([
      pool.execute(countQuery, params),
      pool.execute(dataQuery, [...params, limit, offset])
    ]);
    
    const totalCount = (countResult as RowDataPacket[])[0].total;
    
    // 모든 아이템 ID를 한 번에 수집
    const allItemIds = new Set<string>();
    const rowsData = rows as RowDataPacket[];
    
    rowsData.forEach(row => {
      const needItems = JSON.parse(row.need_items || "{}");
      const rewardItems = JSON.parse(row.reward_items || "{}");
      Object.keys(needItems).forEach(id => allItemIds.add(id));
      Object.keys(rewardItems).forEach(id => allItemIds.add(id));
    });

    // 모든 아이템 정보를 한 번에 조회
    let itemNameMap = new Map<string, string>();
    if (allItemIds.size > 0) {
      const items = await prisma.items.findMany({
        where: {
          itemId: {
            in: Array.from(allItemIds),
          },
        },
        select: {
          itemId: true,
          itemName: true,
        },
      });
      itemNameMap = new Map(items.map(item => [item.itemId, item.itemName]));
    }

    // 우편 데이터 변환
    const mails = rowsData.map(row => {
      const needItems = JSON.parse(row.need_items || "{}");
      const rewardItems = JSON.parse(row.reward_items || "{}");
      
      // 아이템 이름 매핑 (이미 조회된 데이터 사용)
      const mappedNeedItems = mapItemIdsToNames(needItems, itemNameMap);
      const mappedRewardItems = mapItemIdsToNames(rewardItems, itemNameMap);
      
      return {
        id: row.id,
        user_id: row.user_id,
        title: row.title || "",
        content: row.content || "",
        need_items: mappedNeedItems,
        reward_items: mappedRewardItems,
        used: Boolean(row.used),
        created_at: new Date(row.created_at),
        nickname: row.nickname,
      };
      });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      mails,
      metadata: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0,
      },
    };
  } catch (error) {
    console.error("Get personal mails error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "개인 우편 목록 조회 중 오류가 발생했습니다."
    );
  }
}

// 개인 우편 생성
export async function createPersonalMail(values: PersonalMailCreateValues): Promise<PersonalMail> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    // need_items와 reward_items를 JSON 형태로 변환
    const needItems: Record<string, number> = {};
    values.need_items.forEach((item) => {
      needItems[item.itemCode] = item.count;
    });

    const rewardItems: Record<string, number> = {};
    values.reward_items.forEach((item) => {
      rewardItems[item.itemCode] = item.count;
    });

    // 개인 우편 생성
    const insertQuery = `
      INSERT INTO dokku_mail (user_id, title, content, need_items, reward_items, used)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(insertQuery, [
      values.user_id,
      values.title || "",
      values.content || "",
      JSON.stringify(needItems),
      JSON.stringify(rewardItems),
      values.used ? 1 : 0,
    ]);

    const mailId = (result as ResultSetHeader).insertId;

    // 생성된 우편 조회와 로그 작성을 병렬로 실행
    const [[mailRows]] = await Promise.all([
      pool.execute(
      `SELECT m.*, SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname 
       FROM dokku_mail m 
       LEFT JOIN vrp_users u ON m.user_id = u.id 
       WHERE m.id = ?`,
      [mailId]
      ),
      logService.writeAdminLog(`개인 우편 생성: 유저 ID ${values.user_id}`)
    ]);
    
    const mail = (mailRows as RowDataPacket[])[0];

    return {
      id: mail.id,
      user_id: mail.user_id,
      title: mail.title || "",
      content: mail.content || "",
      need_items: JSON.parse(mail.need_items),
      reward_items: JSON.parse(mail.reward_items),
      used: Boolean(mail.used),
      created_at: new Date(mail.created_at),
      nickname: mail.nickname,
    };
  } catch (error) {
    console.error("Create personal mail error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "개인 우편 생성 중 오류가 발생했습니다."
    );
  }
}

// 개인 우편 배치 생성 (간단한 병렬 처리)
export async function createPersonalMailsBatch(
  mailsData: PersonalMailCreateValues[]
): Promise<{ successCount: number; errorCount: number; errors: Array<{ index: number; error: string }> }> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ index: number; error: string }> = [];

    // 배치 크기 설정 (한 번에 처리할 개수)
    const BATCH_SIZE = 5;
    
    for (let i = 0; i < mailsData.length; i += BATCH_SIZE) {
      const batch = mailsData.slice(i, i + BATCH_SIZE);
      
      // 병렬 처리
      const batchPromises = batch.map(async (mailData, batchIndex) => {
        const actualIndex = i + batchIndex;
        try {
          const result = await createPersonalMail(mailData);
          return { success: true, index: actualIndex };
        } catch (error) {
          return {
            success: false,
            index: actualIndex,
            error: error instanceof Error ? error.message : "알 수 없는 오류"
          };
        }
      });

      // 배치 결과 처리
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          errors.push({
            index: result.index,
            error: result.error || "알 수 없는 오류"
          });
        }
      });
    }

    return { successCount, errorCount, errors };
  } catch (error) {
    console.error("Batch create personal mails error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "개인 우편 배치 생성 중 오류가 발생했습니다."
    );
  }
}

// 개인 우편 수정
export async function updatePersonalMail(id: number, values: PersonalMailCreateValues): Promise<PersonalMail> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    // 기존 우편 존재 확인
    const [existingRows] = await pool.execute(
      "SELECT id FROM dokku_mail WHERE id = ?",
      [id]
    );
    
    if ((existingRows as RowDataPacket[]).length === 0) {
      throw new Error("존재하지 않는 우편입니다.");
    }

    // need_items와 reward_items를 JSON 형태로 변환
    const needItems: Record<string, number> = {};
    values.need_items.forEach((item) => {
      needItems[item.itemCode] = item.count;
    });

    const rewardItems: Record<string, number> = {};
    values.reward_items.forEach((item) => {
      rewardItems[item.itemCode] = item.count;
    });

    // 개인 우편 수정
    const updateQuery = `
      UPDATE dokku_mail 
      SET user_id = ?, title = ?, content = ?, need_items = ?, reward_items = ?, used = ?
      WHERE id = ?
    `;

    // 수정과 조회, 로그 작성을 병렬로 실행
    const [, [mailRows]] = await Promise.all([
      pool.execute(updateQuery, [
      values.user_id,
      values.title || "",
      values.content || "",
      JSON.stringify(needItems),
      JSON.stringify(rewardItems),
      values.used ? 1 : 0,
      id,
      ]),
      pool.execute(
      `SELECT m.*, SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname 
       FROM dokku_mail m 
       LEFT JOIN vrp_users u ON m.user_id = u.id 
       WHERE m.id = ?`,
      [id]
      ),
      logService.writeAdminLog(`개인 우편 수정: ID ${id}, 유저 ID ${values.user_id}`)
    ]);
    
    const mail = (mailRows as RowDataPacket[])[0];

    return {
      id: mail.id,
      user_id: mail.user_id,
      title: mail.title || "",
      content: mail.content || "",
      need_items: JSON.parse(mail.need_items),
      reward_items: JSON.parse(mail.reward_items),
      used: Boolean(mail.used),
      created_at: new Date(mail.created_at),
      nickname: mail.nickname,
    };
  } catch (error) {
    console.error("Update personal mail error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "개인 우편 수정 중 오류가 발생했습니다."
    );
  }
}

// 개인 우편 삭제
export async function deletePersonalMail(id: number): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    // 우편 정보 조회 (로그용)
    const [mailRows] = await pool.execute(
      "SELECT user_id FROM dokku_mail WHERE id = ?",
      [id]
    );
    const mail = (mailRows as RowDataPacket[])[0];

    if (!mail) {
      throw new Error("존재하지 않는 우편입니다.");
    }

    // 삭제와 로그 작성을 병렬로 실행
    await Promise.all([
      pool.execute("DELETE FROM dokku_mail WHERE id = ?", [id]),
      logService.writeAdminLog(`개인 우편 삭제: ID ${id}, 유저 ID ${mail.user_id}`)
    ]);
  } catch (error) {
    console.error("Delete personal mail error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "개인 우편 삭제 중 오류가 발생했습니다."
    );
  }
}

// 단체 우편 예약 목록 조회
export async function getGroupMailReserves(
  page: number = 0,
  filter: GroupMailReserveFilter
): Promise<GroupMailReserveList> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    const limit = 50;
    const offset = page * limit;

    // 필터 조건 구성
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (filter.title) {
      whereClause += " AND title LIKE ?";
      params.push(`%${filter.title}%`);
    }

    if (filter.startDate && filter.endDate) {
      const filterStartDate = new Date(filter.startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      
      const filterEndDate = new Date(filter.endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      
      whereClause += " AND start_time >= ? AND start_time <= ?";
      params.push(filterStartDate, filterEndDate);
    }

    // 총 개수 조회와 데이터 조회를 병렬로 실행
    const countQuery = `SELECT COUNT(*) as total FROM dokku_mail_reserve ${whereClause}`;
    const dataQuery = `
      SELECT * FROM dokku_mail_reserve
      ${whereClause}
      ORDER BY start_time DESC
      LIMIT ? OFFSET ?
    `;

    const [[countResult], [rows]] = await Promise.all([
      pool.execute(countQuery, params),
      pool.execute(dataQuery, [...params, limit, offset])
    ]);
    
    const totalCount = (countResult as RowDataPacket[])[0].total;
    const reserves = (rows as RowDataPacket[]).map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      start_time: new Date(row.start_time),
      end_time: new Date(row.end_time),
      rewards: JSON.parse(row.rewards || "{}"),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      reserves,
      metadata: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0,
      },
    };
  } catch (error) {
    console.error("Get group mail reserves error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "단체 우편 예약 목록 조회 중 오류가 발생했습니다."
    );
  }
}

// 단체 우편 예약 생성
export async function createGroupMailReserve(values: GroupMailReserveCreateValues): Promise<GroupMailReserve> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    // rewards를 JSON 형태로 변환
    const rewards: Record<string, number> = {};
    values.rewards.forEach((item) => {
      rewards[item.itemCode] = item.count;
    });

    // 단체 우편 예약 생성
    const insertQuery = `
      INSERT INTO dokku_mail_reserve (title, content, start_time, end_time, rewards)
      VALUES (?, ?, ?, ?, ?)
    `;

    // ISO 문자열을 MySQL DATETIME 형식으로 변환
    const startDateTime = new Date(values.start_time).toISOString().slice(0, 19).replace('T', ' ');
    const endDateTime = new Date(values.end_time).toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.execute(insertQuery, [
      values.title,
      values.content,
      startDateTime,
      endDateTime,
      JSON.stringify(rewards),
    ]);

    const reserveId = (result as ResultSetHeader).insertId;

    // 생성된 예약 조회, 로그 작성, API 호출을 병렬로 실행
    const [[reserveRows]] = await Promise.all([
      pool.execute("SELECT * FROM dokku_mail_reserve WHERE id = ?", [reserveId]),
      logService.writeAdminLog(`단체 우편 예약 생성: ${values.title}`),
      callMailReserveLoadAPI()
    ]);
    
    const reserve = (reserveRows as RowDataPacket[])[0];

    return {
      id: reserve.id,
      title: reserve.title,
      content: reserve.content,
      start_time: new Date(reserve.start_time),
      end_time: new Date(reserve.end_time),
      rewards: JSON.parse(reserve.rewards),
    };
  } catch (error) {
    console.error("Create group mail reserve error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "단체 우편 예약 생성 중 오류가 발생했습니다."
    );
  }
}

// 단체 우편 예약 수정
export async function updateGroupMailReserve(
  id: number,
  values: GroupMailReserveEditValues
): Promise<GroupMailReserve> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    // rewards를 JSON 형태로 변환
    const rewards: Record<string, number> = {};
    values.rewards.forEach((item) => {
      rewards[item.itemCode] = item.count;
    });

    const updateQuery = `
      UPDATE dokku_mail_reserve 
      SET title = ?, content = ?, start_time = ?, end_time = ?, rewards = ?
      WHERE id = ?
    `;

    // ISO 문자열을 MySQL DATETIME 형식으로 변환
    const startDateTime = new Date(values.start_time).toISOString().slice(0, 19).replace('T', ' ');
    const endDateTime = new Date(values.end_time).toISOString().slice(0, 19).replace('T', ' ');

    // 수정, 조회, 로그 작성, API 호출을 병렬로 실행
    const [, [reserveRows]] = await Promise.all([
      pool.execute(updateQuery, [
      values.title,
      values.content,
      startDateTime,
      endDateTime,
      JSON.stringify(rewards),
      id,
      ]),
      pool.execute("SELECT * FROM dokku_mail_reserve WHERE id = ?", [id]),
      logService.writeAdminLog(`단체 우편 예약 수정: ${values.title}`),
      callMailReserveLoadAPI()
    ]);

    const reserve = (reserveRows as RowDataPacket[])[0];

    return {
      id: reserve.id,
      title: reserve.title,
      content: reserve.content,
      start_time: new Date(reserve.start_time),
      end_time: new Date(reserve.end_time),
      rewards: JSON.parse(reserve.rewards),
    };
  } catch (error) {
    console.error("Update group mail reserve error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "단체 우편 예약 수정 중 오류가 발생했습니다."
    );
  }
}

// 단체 우편 예약 삭제
export async function deleteGroupMailReserve(id: number): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    // 예약 정보 조회 (로그용)
    const [reserveRows] = await pool.execute(
      "SELECT title FROM dokku_mail_reserve WHERE id = ?",
      [id]
    );
    const reserve = (reserveRows as RowDataPacket[])[0];

    if (!reserve) {
      throw new Error("존재하지 않는 예약입니다.");
    }

    // 삭제, 로그 작성, API 호출을 병렬로 실행
    await Promise.all([
      pool.execute("DELETE FROM dokku_mail_reserve WHERE id = ?", [id]),
      logService.writeAdminLog(`단체 우편 예약 삭제: ${reserve.title}`),
      callMailReserveLoadAPI()
    ]);
  } catch (error) {
    console.error("Delete group mail reserve error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "단체 우편 예약 삭제 중 오류가 발생했습니다."
    );
  }
}

// 단체 우편 수령 로그 조회
export async function getGroupMailReserveLogs(
  page: number = 1,
  filter: GroupMailReserveLogFilter
): Promise<GroupMailReserveLogList> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    const limit = 50;
    const offset = (page - 1) * limit;

    // 필터 조건 구성
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (filter.reserveId) {
      whereClause += " AND l.reserve_id = ?";
      params.push(filter.reserveId);
    }

    if (filter.userId) {
      whereClause += " AND l.user_id = ?";
      params.push(filter.userId);
    }

    if (filter.startDate && filter.endDate) {
      const filterStartDate = new Date(filter.startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      
      const filterEndDate = new Date(filter.endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      
      whereClause += " AND l.claimed_at >= ? AND l.claimed_at <= ?";
      params.push(filterStartDate, filterEndDate);
    }

    // 총 개수 조회와 데이터 조회를 병렬로 실행
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM dokku_mail_reserve_log l
      ${whereClause}
    `;
    const dataQuery = `
      SELECT 
        l.*,
        SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname
      FROM dokku_mail_reserve_log l
      LEFT JOIN vrp_users u ON l.user_id = u.id
      ${whereClause}
      ORDER BY l.claimed_at DESC
      LIMIT ? OFFSET ?
    `;

    const [[countResult], [rows]] = await Promise.all([
      pool.execute(countQuery, params),
      pool.execute(dataQuery, [...params, limit, offset])
    ]);
    
    const total = (countResult as RowDataPacket[])[0].total;
    const logs = (rows as RowDataPacket[]).map((row) => ({
      reserve_id: row.reserve_id,
      user_id: row.user_id,
      claimed_at: new Date(row.claimed_at),
      nickname: row.nickname,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      metadata: {
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Get group mail reserve logs error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "단체 우편 수령 로그 조회 중 오류가 발생했습니다."
    );
  }
}

// 메일 예약 로드 API 호출
async function callMailReserveLoadAPI(): Promise<void> {
  try {
    const response = await fetch(`${process.env.PRIVATE_API_URL}/DokkuApi/loadMailReserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        key: process.env.PRIVATE_API_KEY || "",
      },
    });

    if (!response.ok) {
      console.error('Mail reserve load API call failed:', response.status);
    }
  } catch (error) {
    console.error('Mail reserve load API call error:', error);
    // API 호출 실패는 메일 시스템 동작에 치명적이지 않으므로 에러를 던지지 않음
  }
} 