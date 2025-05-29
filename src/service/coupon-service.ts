import { auth } from "@/lib/auth-config";
import { hasAccess, generateCouponCode } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import pool from "@/db/mysql";
import { logService } from "./log-service";
import {
  Coupon,
  CouponDisplay,
  CouponList,
  CouponFilter,
  CouponLogList,
  CouponLogFilter,
  RewardItem,
  COUPON_TYPE_MAP,
  COUPON_TYPE_REVERSE_MAP,
  CouponDbType,
  CouponDisplayType
} from "@/types/coupon";
import { CouponCreateValues, CouponEditValues } from "@/lib/validations/coupon";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// 쿠폰 목록 조회
export async function getCouponList(
  page: number = 0,
  filter: CouponFilter
): Promise<{ coupons: CouponDisplay[]; metadata: any }> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      throw new Error("권한이 없습니다.");
    }

    const limit = 50;
    const offset = page * limit;

    // 필터 조건 구성
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (filter.name) {
      whereClause += " AND name LIKE ?";
      params.push(`%${filter.name}%`);
    }

    if (filter.type && filter.type !== "ALL") {
      // 한글 타입을 영문으로 변환하여 검색
      const dbType = COUPON_TYPE_MAP[filter.type as CouponDisplayType];
      whereClause += " AND type = ?";
      params.push(dbType);
    }

    if (filter.startDate && filter.endDate) {
      // 시작일과 종료일 모두 입력된 경우만 처리
      const filterStartDate = new Date(filter.startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      
      const filterEndDate = new Date(filter.endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      
      whereClause += " AND created_at >= ? AND created_at <= ?";
      params.push(filterStartDate, filterEndDate);
    }

    // 총 개수 조회
    const countQuery = `SELECT COUNT(*) as total FROM dokku_coupon ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, params);
    const totalCount = (countResult as RowDataPacket[])[0].total;

    // 쿠폰 목록 조회 (코드 개수와 사용된 코드 개수 포함)
    const query = `
      SELECT 
        c.*,
        COUNT(cc.code) as total_codes,
        COUNT(ccl.coupon_code) as used_codes
      FROM dokku_coupon c
      LEFT JOIN dokku_coupon_code cc ON c.id = cc.coupon_idx
      LEFT JOIN dokku_coupon_code_log ccl ON cc.code = ccl.coupon_code
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(query, [...params, limit, offset]);
    const coupons = (rows as RowDataPacket[]).map((row) => ({
      id: row.id,
      name: row.name,
      type: COUPON_TYPE_REVERSE_MAP[row.type as CouponDbType], // 영문을 한글로 변환
      reward_items: JSON.parse(row.reward_items || "{}"),
      maxcount: row.maxcount,
      start_time: new Date(row.start_time),
      end_time: new Date(row.end_time),
      created_at: new Date(row.created_at),
      _count: {
        codes: row.total_codes,
        usedCodes: row.used_codes,
      },
    })) as CouponDisplay[];

    const totalPages = Math.ceil(totalCount / limit);

    return {
      coupons,
      metadata: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0,
      },
    };
  } catch (error) {
    console.error("Get coupon list error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "쿠폰 목록 조회 중 오류가 발생했습니다."
    );
  }
}

// 중복되지 않는 쿠폰 코드 배치 생성 함수
async function generateUniqueCouponCodes(quantity: number): Promise<string[]> {
  const codes: string[] = [];
  const maxAttempts = quantity * 2; // 충분한 시도 횟수
  let attempts = 0;
  
  while (codes.length < quantity && attempts < maxAttempts) {
    // 배치로 코드 생성 (한 번에 여러 개)
    const batchSize = Math.min(quantity - codes.length, 50);
    const candidateCodes: string[] = [];
    
    for (let i = 0; i < batchSize; i++) {
      candidateCodes.push(generateCouponCode());
    }
    
    // 한 번에 중복 체크
    const placeholders = candidateCodes.map(() => '?').join(',');
    const [existing] = await pool.execute(
      `SELECT code FROM dokku_coupon_code WHERE code IN (${placeholders})`,
      candidateCodes
    );
    
    const existingCodes = new Set((existing as RowDataPacket[]).map(row => row.code));
    
    // 중복되지 않는 코드만 추가
    for (const code of candidateCodes) {
      if (!existingCodes.has(code) && codes.length < quantity) {
        codes.push(code);
      }
    }
    
    attempts++;
  }
  
  if (codes.length < quantity) {
    throw new Error(`요청한 수량(${quantity})만큼 고유한 쿠폰 코드를 생성할 수 없습니다. 생성된 수량: ${codes.length}`);
  }
  
  return codes;
}

// 중복되지 않는 쿠폰 코드 생성 함수 (단일)
async function generateUniqueCouponCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = generateCouponCode();
    
    // 중복 체크
    const [existing] = await pool.execute(
      "SELECT code FROM dokku_coupon_code WHERE code = ?",
      [code]
    );
    
    if ((existing as RowDataPacket[]).length === 0) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error("고유한 쿠폰 코드 생성에 실패했습니다. 다시 시도해주세요.");
}

// 쿠폰 생성
export async function createCoupon(values: CouponCreateValues): Promise<CouponDisplay> {
  const connection = await pool.getConnection();
  
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      throw new Error("권한이 없습니다.");
    }

    // 트랜잭션 시작
    await connection.beginTransaction();

    // reward_items를 JSON 형태로 변환
    const rewardItems: Record<string, number> = {};
    values.reward_items.forEach((item) => {
      rewardItems[item.itemCode] = item.count;
    });

    // 한글 타입을 영문으로 변환
    const dbType = COUPON_TYPE_MAP[values.type];

    // 쿠폰 생성
    const insertQuery = `
      INSERT INTO dokku_coupon (name, type, reward_items, maxcount, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(insertQuery, [
      values.name,
      dbType, // 영문으로 저장
      JSON.stringify(rewardItems),
      values.maxcount || null,
      values.start_time,
      values.end_time,
    ]);

    const couponId = (result as ResultSetHeader).insertId;

    // 쿠폰 코드 생성
    if (values.type === "일반" && values.quantity) {
      // 일반 쿠폰: 중복되지 않는 랜덤 코드 여러 개 배치 생성
      const uniqueCodes = await generateUniqueCouponCodes(values.quantity);
      const codes = uniqueCodes.map(code => [couponId, code]);

      const codeInsertQuery = `
        INSERT INTO dokku_coupon_code (coupon_idx, code) VALUES ?
      `;
      await connection.query(codeInsertQuery, [codes]);
    } else if (values.type === "퍼블릭" && values.code) {
      // 퍼블릭 쿠폰: 고정 코드 중복 체크 후 생성
      const [existing] = await connection.execute(
        "SELECT code FROM dokku_coupon_code WHERE code = ?",
        [values.code]
      );
      
      if ((existing as RowDataPacket[]).length > 0) {
        throw new Error("이미 존재하는 쿠폰 코드입니다.");
      }
      
      const codeInsertQuery = `
        INSERT INTO dokku_coupon_code (coupon_idx, code) VALUES (?, ?)
      `;
      await connection.execute(codeInsertQuery, [couponId, values.code]);
    }

    // 트랜잭션 커밋
    await connection.commit();

    // 생성된 쿠폰 조회
    const [couponRows] = await connection.execute(
      "SELECT * FROM dokku_coupon WHERE id = ?",
      [couponId]
    );
    const coupon = (couponRows as RowDataPacket[])[0];

    await logService.writeAdminLog(`쿠폰 생성: ${values.name}`);

    return {
      id: coupon.id,
      name: coupon.name,
      type: COUPON_TYPE_REVERSE_MAP[coupon.type as CouponDbType], // 영문을 한글로 변환
      reward_items: JSON.parse(coupon.reward_items),
      maxcount: coupon.maxcount,
      start_time: new Date(coupon.start_time),
      end_time: new Date(coupon.end_time),
      created_at: new Date(coupon.created_at),
    };
  } catch (error) {
    // 트랜잭션 롤백
    await connection.rollback();
    console.error("Create coupon error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "쿠폰 생성 중 오류가 발생했습니다."
    );
  } finally {
    connection.release();
  }
}

// 쿠폰 수정
export async function updateCoupon(
  id: number,
  values: CouponEditValues
): Promise<CouponDisplay> {
  const connection = await pool.getConnection();
  
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      throw new Error("권한이 없습니다.");
    }

    // 트랜잭션 시작
    await connection.beginTransaction();

    // 쿠폰 존재 여부 확인
    const [existingCoupon] = await connection.execute(
      "SELECT id, name FROM dokku_coupon WHERE id = ?",
      [id]
    );
    
    if ((existingCoupon as RowDataPacket[]).length === 0) {
      throw new Error("존재하지 않는 쿠폰입니다.");
    }

    // reward_items를 JSON 형태로 변환
    const rewardItems: Record<string, number> = {};
    values.reward_items.forEach((item) => {
      rewardItems[item.itemCode] = item.count;
    });

    const updateQuery = `
      UPDATE dokku_coupon 
      SET name = ?, reward_items = ?, maxcount = ?, start_time = ?, end_time = ?
      WHERE id = ?
    `;

    await connection.execute(updateQuery, [
      values.name,
      JSON.stringify(rewardItems),
      values.maxcount || null,
      values.start_time,
      values.end_time,
      id,
    ]);

    // 트랜잭션 커밋
    await connection.commit();

    // 수정된 쿠폰 조회
    const [couponRows] = await connection.execute(
      "SELECT * FROM dokku_coupon WHERE id = ?",
      [id]
    );
    const coupon = (couponRows as RowDataPacket[])[0];

    await logService.writeAdminLog(`쿠폰 수정: ${values.name}`);

    return {
      id: coupon.id,
      name: coupon.name,
      type: COUPON_TYPE_REVERSE_MAP[coupon.type as CouponDbType], // 영문을 한글로 변환
      reward_items: JSON.parse(coupon.reward_items),
      maxcount: coupon.maxcount,
      start_time: new Date(coupon.start_time),
      end_time: new Date(coupon.end_time),
      created_at: new Date(coupon.created_at),
    };
  } catch (error) {
    // 트랜잭션 롤백
    await connection.rollback();
    console.error("Update coupon error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "쿠폰 수정 중 오류가 발생했습니다."
    );
  } finally {
    connection.release();
  }
}

// 쿠폰 삭제
export async function deleteCoupon(id: number): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      throw new Error("권한이 없습니다.");
    }

    // 트랜잭션 시작
    await connection.beginTransaction();

    // 쿠폰 정보 조회 (로그용 + 존재 여부 확인)
    const [couponRows] = await connection.execute(
      "SELECT name FROM dokku_coupon WHERE id = ?",
      [id]
    );
    const coupon = (couponRows as RowDataPacket[])[0];

    if (!coupon) {
      throw new Error("존재하지 않는 쿠폰입니다.");
    }

    // 사용된 쿠폰인지 확인 (사용된 쿠폰은 삭제 불가)
    const [usedCoupons] = await connection.execute(
      "SELECT COUNT(*) as count FROM dokku_coupon_code_log ccl JOIN dokku_coupon_code cc ON ccl.coupon_code = cc.code WHERE cc.coupon_idx = ?",
      [id]
    );
    const usedCount = (usedCoupons as RowDataPacket[])[0].count;

    if (usedCount > 0) {
      throw new Error("이미 사용된 쿠폰은 삭제할 수 없습니다.");
    }

    // 쿠폰 코드 먼저 삭제
    await connection.execute(
      "DELETE FROM dokku_coupon_code WHERE coupon_idx = ?", 
      [id]
    );

    // 쿠폰 삭제
    await connection.execute("DELETE FROM dokku_coupon WHERE id = ?", [id]);

    // 트랜잭션 커밋
    await connection.commit();

    await logService.writeAdminLog(`쿠폰 삭제: ${coupon.name}`);
  } catch (error) {
    // 트랜잭션 롤백
    await connection.rollback();
    console.error("Delete coupon error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "쿠폰 삭제 중 오류가 발생했습니다."
    );
  } finally {
    connection.release();
  }
}

// 쿠폰 로그 조회
export async function getCouponLogs(
  page: number = 1,
  filter: CouponLogFilter
): Promise<CouponLogList> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    const limit = 50;
    const offset = (page - 1) * limit;

    // 필터 조건 구성
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (filter.userId) {
      whereClause += " AND ccl.user_id = ?";
      params.push(filter.userId);
    }

    if (filter.couponCode) {
      whereClause += " AND ccl.coupon_code LIKE ?";
      params.push(`%${filter.couponCode}%`);
    }

    if (filter.startDate && filter.endDate) {
      // 시작일과 종료일 모두 입력된 경우만 처리
      const filterStartDate = new Date(filter.startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      
      const filterEndDate = new Date(filter.endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      
      whereClause += " AND ccl.time BETWEEN ? AND ?";
      params.push(filterStartDate, filterEndDate);
    }

    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM dokku_coupon_code_log ccl
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, params);
    const total = (countResult as RowDataPacket[])[0].total;

    // 로그 목록 조회 (쿠폰 정보와 닉네임 포함)
    const query = `
      SELECT 
        ccl.*,
        c.name as coupon_name,
        c.type as coupon_type,
        c.reward_items,
        c.maxcount,
        c.start_time,
        c.end_time,
        c.created_at as coupon_created_at,
        SUBSTRING_INDEX(u.last_login, ' ', -1) as nickname
      FROM dokku_coupon_code_log ccl
      LEFT JOIN dokku_coupon c ON ccl.coupon_idx = c.id
      LEFT JOIN vrp_users u ON ccl.user_id = u.id
      ${whereClause}
      ORDER BY ccl.time DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(query, [...params, limit, offset]);
    const records = (rows as RowDataPacket[]).map((row) => ({
      coupon_idx: row.coupon_idx,
      coupon_code: row.coupon_code,
      user_id: row.user_id,
      time: new Date(row.time),
      coupon: row.coupon_name
        ? {
            id: row.coupon_idx,
            name: row.coupon_name,
            type: COUPON_TYPE_REVERSE_MAP[row.coupon_type as CouponDbType], // 영문을 한글로 변환
            reward_items: JSON.parse(row.reward_items || "{}"),
            maxcount: row.maxcount,
            start_time: new Date(row.start_time),
            end_time: new Date(row.end_time),
            created_at: new Date(row.coupon_created_at),
          }
        : undefined,
      nickname: row.nickname,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      records,
      metadata: {
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Get coupon logs error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "쿠폰 로그 조회 중 오류가 발생했습니다."
    );
  }
}

// 쿠폰 코드 목록 조회 (특정 쿠폰의)
export async function getCouponCodes(couponId: number): Promise<string[]> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      throw new Error("권한이 없습니다.");
    }

    const [rows] = await pool.execute(
      "SELECT code FROM dokku_coupon_code WHERE coupon_idx = ? ORDER BY code",
      [couponId]
    );

    return (rows as RowDataPacket[]).map((row) => row.code);
  } catch (error) {
    console.error("Get coupon codes error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "쿠폰 코드 조회 중 오류가 발생했습니다."
    );
  }
}

// CSV 다운로드용 쿠폰 데이터 조회
export async function getCouponListForCSV(
  filter: CouponFilter
): Promise<any[]> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      throw new Error("권한이 없습니다.");
    }

    // 필터 조건 구성
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (filter.name) {
      whereClause += " AND name LIKE ?";
      params.push(`%${filter.name}%`);
    }

    if (filter.type && filter.type !== "ALL") {
      const dbType = COUPON_TYPE_MAP[filter.type as CouponDisplayType];
      whereClause += " AND type = ?";
      params.push(dbType);
    }

    if (filter.startDate && filter.endDate) {
      // 시작일과 종료일 모두 입력된 경우만 처리
      const filterStartDate = new Date(filter.startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      
      const filterEndDate = new Date(filter.endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      
      whereClause += " AND created_at >= ? AND created_at <= ?";
      params.push(filterStartDate, filterEndDate);
    }

    // 실제 DB 컬럼명 그대로 조회 (변환 없음)
    const query = `
      SELECT 
        c.id,
        c.name,
        c.type,
        c.reward_items,
        c.maxcount,
        c.start_time,
        c.end_time,
        c.created_at,
        COUNT(cc.code) as total_codes,
        COUNT(ccl.coupon_code) as used_codes
      FROM dokku_coupon c
      LEFT JOIN dokku_coupon_code cc ON c.id = cc.coupon_idx
      LEFT JOIN dokku_coupon_code_log ccl ON cc.code = ccl.coupon_code
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    const [rows] = await pool.execute(query, params);

    await logService.writeAdminLog("쿠폰 목록 CSV 다운로드");

    // 원본 데이터 그대로 반환 (변환 없음)
    return rows as any[];
  } catch (error) {
    console.error("Get coupon list for CSV error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "쿠폰 목록 조회 중 오류가 발생했습니다."
    );
  }
}

// 체크된 쿠폰들의 데이터 조회 (CSV용)
export async function getSelectedCouponsForCSV(
  couponIds: number[]
): Promise<any[]> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      throw new Error("권한이 없습니다.");
    }

    if (couponIds.length === 0) {
      return [];
    }

    // 실제 DB 컬럼명 그대로 조회 (변환 없음)
    const placeholders = couponIds.map(() => '?').join(',');
    const query = `
      SELECT 
        c.id,
        c.name,
        c.type,
        c.reward_items,
        c.maxcount,
        c.start_time,
        c.end_time,
        c.created_at,
        COUNT(cc.code) as total_codes,
        COUNT(ccl.coupon_code) as used_codes
      FROM dokku_coupon c
      LEFT JOIN dokku_coupon_code cc ON c.id = cc.coupon_idx
      LEFT JOIN dokku_coupon_code_log ccl ON cc.code = ccl.coupon_code
      WHERE c.id IN (${placeholders})
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    const [rows] = await pool.execute(query, couponIds);

    await logService.writeAdminLog(`선택된 쿠폰 데이터 CSV 다운로드: ${couponIds.join(', ')}`);

    // 원본 데이터 그대로 반환 (변환 없음)
    return rows as any[];
  } catch (error) {
    console.error("Get selected coupons for CSV error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "선택된 쿠폰 데이터 조회 중 오류가 발생했습니다."
    );
  }
}

// 체크된 쿠폰들의 코드 조회 (CSV용)
export async function getSelectedCouponCodesForCSV(
  couponIds: number[]
): Promise<{ couponId: number; couponName: string; codes: any[] }[]> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      throw new Error("권한이 없습니다.");
    }

    if (couponIds.length === 0) {
      return [];
    }

    // 실제 DB 컬럼명 그대로 조회 (변환 없음)
    const placeholders = couponIds.map(() => '?').join(',');
    const query = `
      SELECT 
        c.id as coupon_id,
        c.name as coupon_name,
        cc.coupon_idx,
        cc.code
      FROM dokku_coupon c
      LEFT JOIN dokku_coupon_code cc ON c.id = cc.coupon_idx
      WHERE c.id IN (${placeholders})
      ORDER BY c.id, cc.code
    `;

    const [rows] = await pool.execute(query, couponIds);
    
    // 쿠폰별로 코드들을 그룹핑
    const couponCodesMap = new Map<number, { couponName: string; codes: any[] }>();
    
    (rows as RowDataPacket[]).forEach((row) => {
      const couponId = row.coupon_id;
      const couponName = row.coupon_name;
      
      if (!couponCodesMap.has(couponId)) {
        couponCodesMap.set(couponId, { couponName, codes: [] });
      }
      
      if (row.code) {
        // 원본 데이터 구조 그대로 추가 (실제 테이블 구조에 맞춤)
        couponCodesMap.get(couponId)!.codes.push({
          coupon_idx: row.coupon_idx,
          code: row.code
        });
      }
    });

    const result = Array.from(couponCodesMap.entries()).map(([couponId, data]) => ({
      couponId,
      couponName: data.couponName,
      codes: data.codes,
    }));

    await logService.writeAdminLog(`선택된 쿠폰 코드 CSV 다운로드: ${couponIds.join(', ')}`);

    return result;
  } catch (error) {
    console.error("Get selected coupon codes for CSV error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "선택된 쿠폰 코드 조회 중 오류가 발생했습니다."
    );
  }
}