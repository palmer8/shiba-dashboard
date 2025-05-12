import pool from "@/db/mysql";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { auth } from "@/lib/auth-config";
import { logService } from "./log-service";

export type BanRecord = {
  id: string;
  user_id: string | null;
  name: string;
  banreason: string;
  identifiers: string;
  created_at: string;
};

export type BanFilters = {
  page?: number;
  user_id?: string;
  name?: string;
  banreason?: string;
  identifiers?: string;
  fromDate?: string;
  toDate?: string;
};

export type AddBanData = {
  user_id: string;
  name: string;
  banreason: string;
  identifiers: string[];
};

export type EditBanData = {
  id: string;
  banreason: string;
  identifiers: string[];
};

class BanService {
  async getBanList(filters: BanFilters) {
    const pageSize = 50;
    const page = filters.page || 1;
    const offset = (page - 1) * pageSize;

    const whereClause: string[] = [];
    const queryParams: (string | number | Date)[] = [];

    if (filters.user_id) {
      whereClause.push("user_id = ?");
      queryParams.push(filters.user_id);
    }
    if (filters.name) {
      whereClause.push("name LIKE ?");
      queryParams.push(`%${filters.name}%`);
    }
    if (filters.banreason) {
      whereClause.push("banreason LIKE ?");
      queryParams.push(`%${filters.banreason}%`);
    }
    if (filters.identifiers) {
      whereClause.push("identifiers LIKE ?");
      queryParams.push(`%${filters.identifiers}%`);
    }
    if (filters.fromDate && filters.toDate) {
      whereClause.push("created_at BETWEEN ? AND ?");
      queryParams.push(filters.fromDate, filters.toDate);
    }

    const whereString =
      whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

    // 전체 개수
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM dokku_hwidban ${whereString}`,
      queryParams
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    // 데이터 조회
    const [records] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM dokku_hwidban ${whereString} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...queryParams, pageSize, offset]
    );

    return {
      success: true,
      data: {
        records: records as BanRecord[],
        metadata: {
          total,
          page,
          totalPages,
        },
      },
      error: null,
    };
  }

  async generateBanId(): Promise<string> {
    const charset =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let banId = "";
    let isUnique = false;
    while (!isUnique) {
      banId = "";
      for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        banId += charset[randomIndex];
      }
      // 중복 체크
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM dokku_hwidban WHERE id = ?",
        [banId]
      );
      if ((rows as RowDataPacket[]).length === 0) isUnique = true;
    }
    return banId;
  }

  async addBan(data: AddBanData) {
    try {
      // Ban ID 생성
      const banId = await this.generateBanId();
      // 외부 API 호출
      const apiRes = await fetch(
        `${process.env.PRIVATE_API_URL}/DokkuApi/updateHwidBan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            key: process.env.PRIVATE_API_KEY || "",
          },
          body: JSON.stringify({
            action: "ban",
            userid: data.user_id,
            reason: data.banreason,
            identifiers: data.identifiers,
          }),
        }
      );
      const res = await apiRes.json();
      console.log(res);

      if (!apiRes.ok) {
        return { success: false, error: res.message, data: null };
      }
      // 어드민 로그 추가
      const session = await auth();
      if (session?.user) {
        const reasonShort =
          data.banreason.length > 10
            ? data.banreason.slice(0, 10) + "..."
            : data.banreason;
        const idsCount = Array.isArray(data.identifiers)
          ? data.identifiers.length
          : 0;
        await logService.writeAdminLog(
          `${session.user.nickname}(${data.user_id}) 밴 등록: 사유=${reasonShort}, ids=${idsCount}개, id=${banId}`
        );
      }
      return {
        success: true,
        data: banId,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "알 수 없는 에러",
      };
    }
  }

  async editBan(data: EditBanData) {
    try {
      // 외부 API 호출 (banreason만 수정 시에는 필요 없을 수 있음, identifiers 변경 시만 필요하다면 분기 가능)
      // DB update
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE dokku_hwidban SET banreason = ?, identifiers = ? WHERE id = ?`,
        [data.banreason, JSON.stringify(data.identifiers), data.id]
      );
      // 어드민 로그 추가
      const session = await auth();
      if (session?.user) {
        const reasonShort =
          data.banreason.length > 10
            ? data.banreason.slice(0, 10) + "..."
            : data.banreason;
        const idsCount = Array.isArray(data.identifiers)
          ? data.identifiers.length
          : 0;
        await logService.writeAdminLog(
          `${session.user.nickname} 밴 수정: id=${data.id}, 사유=${reasonShort}, ids=${idsCount}개`
        );
      }
      return {
        success: result.affectedRows > 0,
        data: data.id,
        error: result.affectedRows > 0 ? null : "수정 실패",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "알 수 없는 에러",
      };
    }
  }

  async deleteBan(id: string) {
    try {
      // 외부 API 호출
      const apiRes = await fetch(
        `${process.env.PRIVATE_API_URL}/DokkuApi/updateHwidBan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            key: process.env.PRIVATE_API_KEY || "",
          },
          body: JSON.stringify({
            action: "unban",
            banid: id,
          }),
        }
      );
      const res = await apiRes.json();
      console.log(res);

      if (!apiRes.ok) {
        return { success: false, error: "API 호출 실패", data: null };
      }
      // DB delete
      const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM dokku_hwidban WHERE id = ?`,
        [id]
      );
      // 어드민 로그 추가
      const session = await auth();
      if (session?.user) {
        await logService.writeAdminLog(
          `${session.user.nickname} 밴 해제: id=${id}`
        );
      }
      return {
        success: result.affectedRows > 0,
        data: id,
        error: result.affectedRows > 0 ? null : "삭제 실패",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "알 수 없는 에러",
      };
    }
  }
}

export const banService = new BanService();
