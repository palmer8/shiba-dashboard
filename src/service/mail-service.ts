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
  MailTemplate,
  MailTemplateList,
  SimpleMailCreateValues,
} from "@/types/mail";
import {
  PersonalMailCreateValues,
  GroupMailReserveCreateValues,
  GroupMailReserveEditValues,
} from "@/lib/validations/mail";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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

    // 조회 조건을 로그로 기록 (상세 정보 추가)
    const filterDesc = [];
    if (filter.userId) filterDesc.push(`유저: ${filter.userId}`);
    if (filter.used !== undefined) filterDesc.push(`사용여부: ${filter.used ? '사용됨' : '미사용'}`);
    if (filter.startDate && filter.endDate) {
      filterDesc.push(`기간: ${filter.startDate} ~ ${filter.endDate}`);
    }

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
      // 상세한 로그 작성
      logService.writeAdminLog(
        `${session.user.nickname} 개인 우편 생성: 대상=${values.user_id}, 제목="${values.title || '제목없음'}", 내용="${(values.content || '').substring(0, 30)}${(values.content || '').length > 30 ? '...' : ''}", 필요아이템=${values.need_items.length}개, 보상아이템=${values.reward_items.length}개, 사용여부=${values.used ? 'Y' : 'N'}, ID=${mailId}`
      )
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

// 메일 발송 (보상/사용 여부 제외, 스태프 이상 권한)
export async function sendSimpleMail(values: SimpleMailCreateValues): Promise<PersonalMail> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    // 메일 생성 (보상/사용 여부 제외)
    const insertQuery = `
      INSERT INTO dokku_mail (user_id, title, content, need_items, reward_items, used)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(insertQuery, [
      values.user_id,
      values.title || "",
      values.content || "",
      null, // 빈 need_items
      null, // 빈 reward_items
      0, // 사용되지 않음으로 설정
    ]);

    const mailId = (result as ResultSetHeader).insertId;

    // 생성된 메일 조회
    const [[mailRows]] = await Promise.all([
      pool.execute(
        `SELECT m.*, SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname
         FROM dokku_mail m
         LEFT JOIN vrp_users u ON m.user_id = u.id
         WHERE m.id = ?`,
        [mailId]
      ),
      // 상세한 로그 작성
      logService.writeAdminLog(
        `${session.user.nickname} 간단 메일 발송: 대상=${values.user_id}, 제목="${values.title || '제목없음'}", 내용="${(values.content || '').substring(0, 50)}${(values.content || '').length > 50 ? '...' : ''}", ID=${mailId}`
      )
    ]);

    const mail = (mailRows as RowDataPacket[])[0];

    return {
      id: mail.id,
      user_id: mail.user_id,
      title: mail.title || "",
      content: mail.content || "",
      need_items: {},
      reward_items: {},
      used: false,
      created_at: new Date(mail.created_at),
      nickname: mail.nickname,
    };
  } catch (error) {
    console.error("Send simple mail error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "메일 발송 중 오류가 발생했습니다."
    );
  }
}

// 개인 우편 배치 생성 (병렬 처리)
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

    // 기존 우편 존재 확인 및 정보 조회 (로그용)
    const [existingRows] = await pool.execute(
      "SELECT user_id, title FROM dokku_mail WHERE id = ?",
      [id]
    );

    if ((existingRows as RowDataPacket[]).length === 0) {
      throw new Error("존재하지 않는 우편입니다.");
    }

    const existingMail = (existingRows as RowDataPacket[])[0];

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
      // 상세한 로그 작성 (변경 전후 정보 포함)
      logService.writeAdminLog(
        `${session.user.nickname} 개인 우편 수정: ID=${id}, 대상변경=${existingMail.user_id}→${values.user_id}, 제목변경="${existingMail.title}"→"${values.title || '제목없음'}", 내용="${(values.content || '').substring(0, 30)}${(values.content || '').length > 30 ? '...' : ''}", 필요아이템=${values.need_items.length}개, 보상아이템=${values.reward_items.length}개, 사용여부=${values.used ? 'Y' : 'N'}`
      )
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
      "SELECT user_id, title, content FROM dokku_mail WHERE id = ?",
      [id]
    );
    const mail = (mailRows as RowDataPacket[])[0];

    if (!mail) {
      throw new Error("존재하지 않는 우편입니다.");
    }

    // 삭제와 로그 작성을 병렬로 실행
    await Promise.all([
      pool.execute("DELETE FROM dokku_mail WHERE id = ?", [id]),
      // 상세한 로그 작성
      logService.writeAdminLog(
        `${session.user.nickname} 개인 우편 삭제: ID=${id}, 대상=${mail.user_id}, 제목="${mail.title || '제목없음'}", 내용="${(mail.content || '').substring(0, 30)}${(mail.content || '').length > 30 ? '...' : ''}"`
      )
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
    const countQuery = `SELECT COUNT(*) as total FROM dokku_hottime_event ${whereClause}`;
    const dataQuery = `
      SELECT * FROM dokku_hottime_event
      ${whereClause}
      ORDER BY start_time DESC
      LIMIT ? OFFSET ?
    `;

    const [[countResult], [rows]] = await Promise.all([
      pool.execute(countQuery, params),
      pool.execute(dataQuery, [...params, limit, offset])
    ]);

    const totalCount = (countResult as RowDataPacket[])[0].total;
    const reserves = (rows as RowDataPacket[]).map((row) => {
      // reward 필드를 [{itemcode: string, amount: number}] 형식으로 파싱
      let rewards: Record<string, number> = {};
      try {
        const parsedRewards = JSON.parse(row.reward || "[]");
        if (Array.isArray(parsedRewards)) {
          // [{itemcode: "test", amount: 1}] 형식에서 {test: 1} 형식으로 변환
          parsedRewards.forEach((item) => {
            if (item.itemcode && typeof item.amount === "number") {
              rewards[item.itemcode] = item.amount;
            }
          });
        }
      } catch (e) {
        console.warn("Failed to parse reward JSON:", row.reward);
        rewards = {};
      }

      return {
        id: row.id,
        title: row.title,
        content: row.content,
        start_time: new Date(row.start_time),
        end_time: new Date(row.end_time),
        rewards,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    // 조회 조건을 로그로 기록 (상세 정보 추가)
    const filterDesc = [];
    if (filter.title) filterDesc.push(`제목: ${filter.title}`);
    if (filter.startDate && filter.endDate) {
      filterDesc.push(`기간: ${filter.startDate} ~ ${filter.endDate}`);
    }

    await logService.writeAdminLog(
      `${session.user.nickname} 단체 우편 예약 목록 조회: 페이지=${page + 1}, 총=${totalCount}개${filterDesc.length > 0 ? `, 필터=[${filterDesc.join(', ')}]` : ''}`
    );

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

    // rewards를 [{itemcode, amount}] 배열 JSON으로 변환
    const rewardsArray = values.rewards.map((item) => ({
      itemcode: item.itemCode,
      amount: item.count,
    }));

    // 단체 우편 예약 생성 (dokku_hottime_event)
    const insertQuery = `
      INSERT INTO dokku_hottime_event (title, content, start_time, end_time, reward)
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
      JSON.stringify(rewardsArray),
    ]);

    const reserveId = (result as ResultSetHeader).insertId;

    // 생성된 예약 조회와 로그 작성을 병렬로 실행 (외부 API 호출은 비동기 분리)
    const [[reserveRows]] = await Promise.all([
      pool.execute("SELECT * FROM dokku_hottime_event WHERE id = ?", [reserveId]),
      // 상세한 로그 작성
      logService.writeAdminLog(
        `${session.user.nickname} 단체 우편 예약 생성: 제목="${values.title}", 내용="${values.content.substring(0, 30)}${values.content.length > 30 ? '...' : ''}", 시작=${startDateTime}, 종료=${endDateTime}, 보상아이템=${values.rewards.length}개, ID=${reserveId}`
      )
    ]);

    // 외부 API 호출은 응답을 블로킹하지 않도록 비동기로 트리거
    setTimeout(() => {
      callMailReserveLoadAPI().catch((err) => console.error("Mail reserve load async error:", err));
    }, 0);

    const reserve = (reserveRows as RowDataPacket[])[0];

    // reward 필드를 파싱하여 반환
    let rewards: Record<string, number> = {};
    try {
      const parsedRewards = JSON.parse(reserve.reward || "[]");
      if (Array.isArray(parsedRewards)) {
        parsedRewards.forEach((item) => {
          if (item.itemcode && typeof item.amount === "number") {
            rewards[item.itemcode] = item.amount;
          }
        });
      }
    } catch (e) {
      console.warn("Failed to parse reward JSON:", reserve.reward);
      rewards = {};
    }

    return {
      id: reserve.id,
      title: reserve.title,
      content: reserve.content,
      start_time: new Date(reserve.start_time),
      end_time: new Date(reserve.end_time),
      rewards,
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

    // 기존 예약 정보 조회 (로그용)
    const [existingRows] = await pool.execute(
      "SELECT title, start_time, end_time FROM dokku_hottime_event WHERE id = ?",
      [id]
    );

    if ((existingRows as RowDataPacket[]).length === 0) {
      throw new Error("존재하지 않는 예약입니다.");
    }

    const existingReserve = (existingRows as RowDataPacket[])[0];

    // rewards를 [{itemcode, amount}] 배열 JSON으로 변환
    const rewardsArray = values.rewards.map((item) => ({
      itemcode: item.itemCode,
      amount: item.count,
    }));

    // ISO 문자열을 MySQL DATETIME 형식으로 변환
    const startDateTime = new Date(values.start_time).toISOString().slice(0, 19).replace('T', ' ');
    const endDateTime = new Date(values.end_time).toISOString().slice(0, 19).replace('T', ' ');

    // 단체 우편 예약 수정
    const updateQuery = `
      UPDATE dokku_hottime_event 
      SET title = ?, content = ?, start_time = ?, end_time = ?, reward = ?
      WHERE id = ?
    `;

    // 수정과 조회, 로그 작성을 병렬로 실행
    const [, [reserveRows]] = await Promise.all([
      pool.execute(updateQuery, [
        values.title,
        values.content,
        startDateTime,
        endDateTime,
        JSON.stringify(rewardsArray),
        id,
      ]),
      pool.execute("SELECT * FROM dokku_hottime_event WHERE id = ?", [id]),
      // 상세한 로그 작성 (변경 전후 정보 포함)
      logService.writeAdminLog(
        `${session.user.nickname} 단체 우편 예약 수정: ID=${id}, 제목변경="${existingReserve.title}"→"${values.title}", 내용="${values.content.substring(0, 30)}${values.content.length > 30 ? '...' : ''}", 시작변경=${new Date(existingReserve.start_time).toISOString().slice(0, 19).replace('T', ' ')}→${startDateTime}, 종료변경=${new Date(existingReserve.end_time).toISOString().slice(0, 19).replace('T', ' ')}→${endDateTime}, 보상아이템=${values.rewards.length}개`
      )
    ]);

    // 외부 API 호출은 응답을 블로킹하지 않도록 비동기로 트리거
    setTimeout(() => {
      callMailReserveLoadAPI().catch((err) => console.error("Mail reserve load async error:", err));
    }, 0);

    const reserve = (reserveRows as RowDataPacket[])[0];

    // reward 필드를 파싱하여 반환
    let rewards: Record<string, number> = {};
    try {
      const parsedRewards = JSON.parse(reserve.reward || "[]");
      if (Array.isArray(parsedRewards)) {
        parsedRewards.forEach((item) => {
          if (item.itemcode && typeof item.amount === "number") {
            rewards[item.itemcode] = item.amount;
          }
        });
      }
    } catch (e) {
      console.warn("Failed to parse reward JSON:", reserve.reward);
      rewards = {};
    }

    return {
      id: reserve.id,
      title: reserve.title,
      content: reserve.content,
      start_time: new Date(reserve.start_time),
      end_time: new Date(reserve.end_time),
      rewards,
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
      "SELECT title, start_time, end_time FROM dokku_hottime_event WHERE id = ?",
      [id]
    );
    const reserve = (reserveRows as RowDataPacket[])[0];

    if (!reserve) {
      throw new Error("존재하지 않는 예약입니다.");
    }

    // 삭제, 로그 작성, API 호출을 병렬로 실행
    await Promise.all([
      pool.execute("DELETE FROM dokku_hottime_event WHERE id = ?", [id]),
      // 상세한 로그 작성
      logService.writeAdminLog(
        `${session.user.nickname} 단체 우편 예약 삭제: ID=${id}, 제목="${reserve.title}", 시작=${new Date(reserve.start_time).toISOString().slice(0, 19).replace('T', ' ')}, 종료=${new Date(reserve.end_time).toISOString().slice(0, 19).replace('T', ' ')}`
      )
    ]);

    // 외부 API 호출은 응답을 블로킹하지 않도록 비동기로 트리거
    setTimeout(() => {
      callMailReserveLoadAPI().catch((err) => console.error("Mail reserve load async error:", err));
    }, 0);
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

    if (filter.eventId) {
      whereClause += " AND l.event_id = ?";
      params.push(filter.eventId);
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
      FROM dokku_hottime_log l
      ${whereClause}
    `;
    const dataQuery = `
      SELECT 
        l.*,
        SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname
      FROM dokku_hottime_log l
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
      event_id: row.event_id,
      user_id: row.user_id,
      claimed_at: new Date(row.claimed_at),
      nickname: row.nickname,
    }));

    const totalPages = Math.ceil(total / limit);

    // 조회 조건을 로그로 기록 (상세 정보 추가)
    const filterDesc = [];
    if (filter.eventId) filterDesc.push(`이벤트 ID: ${filter.eventId}`);
    if (filter.userId) filterDesc.push(`유저: ${filter.userId}`);
    if (filter.startDate && filter.endDate) {
      filterDesc.push(`기간: ${filter.startDate} ~ ${filter.endDate}`);
    }

    await logService.writeAdminLog(
      `${session.user.nickname} 단체 우편 수령 로그 조회: 페이지=${page}, 총=${total}개${filterDesc.length > 0 ? `, 필터=[${filterDesc.join(', ')}]` : ''}`
    );

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
  }
}

async function callReloadGroupMailAPI(): Promise<void> {
  try {
    const response = await fetch(`${process.env.PRIVATE_API_URL}/DokkuApi/reloadGroupMail`, {
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
  }
}

// 메일 템플릿 목록 조회
export async function getMailTemplates(
  page: number = 0
): Promise<MailTemplateList> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    const limit = 20;
    const offset = page * limit;

    // 총 개수와 템플릿 목록을 병렬로 조회
    const [totalResult, templates] = await Promise.all([
      prisma.mailTemplate.count(),
      prisma.mailTemplate.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          registrant: {
            select: {
              nickname: true,
              userId: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalResult / limit);

    return {
      templates,
      metadata: {
        total: totalResult,
        page: page + 1, // 1-based
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0,
      },
    };
  } catch (error) {
    console.error("Get mail templates error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "메일 템플릿 목록 조회 중 오류가 발생했습니다."
    );
  }
}

// 메일 템플릿 생성
export async function createMailTemplate(
  title: string,
  content: string
): Promise<MailTemplate> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    const template = await prisma.mailTemplate.create({
      data: {
        title,
        content,
        registrantId: session.user.id,
      },
      include: {
        registrant: {
          select: {
            nickname: true,
            userId: true,
          },
        },
      },
    });

    // 상세한 로그 작성
    await logService.writeAdminLog(
      `${session.user.nickname} 메일 템플릿 생성: 제목="${title}", 내용="${content.substring(0, 50)}${content.length > 50 ? '...' : ''}", ID=${template.id}`
    );

    return template;
  } catch (error) {
    console.error("Create mail template error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "메일 템플릿 생성 중 오류가 발생했습니다."
    );
  }
}

// 메일 템플릿 수정
export async function updateMailTemplate(
  id: string,
  title: string,
  content: string
): Promise<MailTemplate> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    const template = await prisma.mailTemplate.update({
      where: { id },
      data: {
        title,
        content,
      },
      include: {
        registrant: {
          select: {
            nickname: true,
            userId: true,
          },
        },
      },
    });

    // 상세한 로그 작성
    await logService.writeAdminLog(
      `${session.user.nickname} 메일 템플릿 수정: ID=${id}, 제목="${title}", 내용="${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
    );

    return template;
  } catch (error) {
    console.error("Update mail template error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "메일 템플릿 수정 중 오류가 발생했습니다."
    );
  }
}

// 메일 템플릿 삭제
export async function deleteMailTemplate(id: string): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.STAFF)) {
      throw new Error("권한이 없습니다.");
    }

    // 템플릿 정보 조회 (로그용)
    const template = await prisma.mailTemplate.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!template) {
      throw new Error("존재하지 않는 템플릿입니다.");
    }

    await prisma.mailTemplate.delete({
      where: { id },
    });

    // 상세한 로그 작성
    await logService.writeAdminLog(
      `${session.user.nickname} 메일 템플릿 삭제: ID=${id}, 제목="${template.title}"`
    );
  } catch (error) {
    console.error("Delete mail template error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "메일 템플릿 삭제 중 오류가 발생했습니다."
    );
  }
}