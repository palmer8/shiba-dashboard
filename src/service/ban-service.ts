import pool from "@/db/mysql";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { auth } from "@/lib/auth-config";
import { logService } from "./log-service";

// 환경 변수 (실제 환경에 맞게 .env 파일 등에 설정 필요)
const DOKKU_API_URL = process.env.PRIVATE_API_URL; // 예: "https://localhost:30120"
const DOKKU_API_KEY = process.env.PRIVATE_API_KEY; // API 키가 필요한 경우
const RELOAD_HWID_BAN_API_URL =
  "http://141.11.194.130:30120/DokkuApi/reloadHwidBan";

export type BanRecord = {
  id: string; // Ban ID
  user_id: string | null;
  name: string;
  banreason: string;
  identifiers: string[]; // JSON 배열에서 파싱된 문자열 배열
  created_at: string;
};

export type BanFilters = {
  page?: number;
  user_id?: string;
  name?: string;
  banreason?: string;
  identifiers?: string; // 검색 시에는 문자열로 받고, LIKE 검색에 사용
  fromDate?: string;
  toDate?: string;
};

// 하드밴 관리 메뉴에서 DB 직접 추가 시 사용
export type AddBanData = {
  user_id: string | null; // 오프라인 밴의 경우 user_id가 있을 수도 있고 없을 수도 있음
  name: string;
  banreason: string;
  identifiers: string[]; // 문자열 배열 형태로 받음
};

// 하드밴 관리 메뉴에서 DB 직접 수정 시 사용
export type EditBanData = {
  id: string; // Ban ID
  user_id: string | null;
  name: string;
  banreason: string;
  identifiers: string[];
};

class BanService {
  private async reloadHwidBanCache(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const apiRes = await fetch(RELOAD_HWID_BAN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: DOKKU_API_KEY || "", // reloadHwidBan API가 키를 요구한다면 추가
        },
        body: JSON.stringify({}),
      });

      if (!apiRes.ok) {
        const errorData = await apiRes.text();
        console.error("reloadHwidBanCache API error:", errorData);
        return {
          success: false,
          error: `API 호출 실패: ${apiRes.status} ${errorData}`,
        };
      }
      console.log("HwidBan cache reloaded successfully.");
      return { success: true };
    } catch (error) {
      console.error("Error in reloadHwidBanCache:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "캐시 리로드 중 알 수 없는 에러",
      };
    }
  }

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
      // identifiers는 DB에 JSON 문자열로 저장되어 있으므로, LIKE 검색이 유용할 수 있음
      whereClause.push("identifiers LIKE ?");
      queryParams.push(`%${filters.identifiers}%`);
    }
    if (filters.fromDate && filters.toDate) {
      whereClause.push("created_at BETWEEN ? AND ?");
      queryParams.push(filters.fromDate, filters.toDate);
    }

    const whereString =
      whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM dokku_hwidban ${whereString}`,
      queryParams
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    const [records] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM dokku_hwidban ${whereString} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...queryParams, pageSize, offset]
    );

    const parsedRecords = records.map((record) => {
      let parsedIdentifiers: string[] = [];
      if (record.identifiers && typeof record.identifiers === "string") {
        try {
          parsedIdentifiers = JSON.parse(record.identifiers);
          if (!Array.isArray(parsedIdentifiers)) {
            console.warn(
              `Failed to parse identifiers as array for record id ${record.id}: ${record.identifiers}`
            );
            parsedIdentifiers = [record.identifiers]; // 파싱 실패 시 원본 문자열을 배열 요소로
          }
        } catch (e) {
          console.warn(
            `Error parsing identifiers for record id ${record.id}: ${record.identifiers}`,
            e
          );
          parsedIdentifiers = [record.identifiers]; // 에러 발생 시 원본 문자열을 배열 요소로
        }
      } else if (Array.isArray(record.identifiers)) {
        // 이미 배열 형태인 경우 (이 경우는 없어야 하지만, 방어 코드)
        parsedIdentifiers = record.identifiers;
      }
      return {
        ...record,
        identifiers: parsedIdentifiers,
      } as BanRecord;
    });

    return {
      success: true,
      data: {
        records: parsedRecords,
        metadata: {
          total,
          page,
          totalPages,
        },
      },
      error: null,
    };
  }

  async getBanRecordByUserId(
    userId: string
  ): Promise<{ data: BanRecord | null; success: boolean; error?: string }> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM dokku_hwidban WHERE user_id = ?",
        [userId]
      );
      if (rows.length === 0) {
        return { success: true, data: null };
      }
      const record = rows[0];
      let parsedIdentifiers: string[] = [];
      if (record.identifiers && typeof record.identifiers === "string") {
        try {
          parsedIdentifiers = JSON.parse(record.identifiers);
          if (!Array.isArray(parsedIdentifiers))
            parsedIdentifiers = [record.identifiers];
        } catch (e) {
          parsedIdentifiers = [record.identifiers];
        }
      } else if (Array.isArray(record.identifiers)) {
        parsedIdentifiers = record.identifiers;
      }

      return {
        success: true,
        data: { ...record, identifiers: parsedIdentifiers } as BanRecord,
      };
    } catch (error) {
      console.error("Error in getBanRecordByUserId:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "유저 밴 기록 조회 중 에러",
      };
    }
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
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM dokku_hwidban WHERE id = ?",
        [banId]
      );
      if (rows.length === 0) isUnique = true;
    }
    return banId;
  }

  // 실시간 유저 조회 화면에서 온라인 유저 대상
  async banUserViaApi(userId: number, reason: string) {
    try {
      const apiRes = await fetch(`${DOKKU_API_URL}/DokkuApi/updateHwidBan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: DOKKU_API_KEY || "",
        },
        body: JSON.stringify({
          action: "ban",
          userid: userId,
          reason: reason,
        }),
      });

      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        return {
          success: false,
          error: `API 호출 실패: ${apiRes.status} ${errorText}`,
          data: null,
        };
      }

      // API를 통한 밴은 자동 반영되므로 reloadHwidBanCache 호출 불필요 (명세 기준)
      // 관리자 로그 추가
      const session = await auth();
      if (session?.user) {
        await logService.writeAdminLog(
          `${session.user.nickname} 유저 API 밴: 대상 ID=${userId}, 사유=${reason}`
        );
      }
      return { success: true, data: { userId, reason }, error: null };
    } catch (error) {
      console.error("Error in banUserViaApi:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "API 밴 처리 중 알 수 없는 에러",
      };
    }
  }

  // 실시간 유저 조회 화면에서 사용
  async unbanUserViaApi(banId: string) {
    try {
      const apiRes = await fetch(`${DOKKU_API_URL}/DokkuApi/updateHwidBan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: DOKKU_API_KEY || "",
        },
        body: JSON.stringify({
          action: "unban",
          banid: banId,
        }),
      });

      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        return {
          success: false,
          error: `API 호출 실패: ${apiRes.status} ${errorText}`,
          data: null,
        };
      }

      // API를 통한 언밴은 자동 반영되므로 reloadHwidBanCache 호출 불필요 (명세 기준)
      const session = await auth();
      if (session?.user) {
        await logService.writeAdminLog(
          `${session.user.nickname} 유저 API 언밴: 대상 BanID=${banId}`
        );
      }
      return { success: true, data: { banId }, error: null };
    } catch (error) {
      console.error("Error in unbanUserViaApi:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "API 언밴 처리 중 알 수 없는 에러",
      };
    }
  }

  // 하드밴 관리 메뉴에서 사용 (DB 직접 추가)
  async addBanDirectlyToDb(data: AddBanData) {
    const banId = await this.generateBanId();
    try {
      await pool.execute<ResultSetHeader>(
        "INSERT INTO dokku_hwidban (id, user_id, name, banreason, identifiers, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [
          banId,
          data.user_id || null, // user_id가 없으면 null
          data.name,
          data.banreason,
          JSON.stringify(data.identifiers),
        ]
      );

      // DB 수동 수정 후 캐시 리로드 API 호출
      const reloadResult = await this.reloadHwidBanCache();
      if (!reloadResult.success) {
        // 캐시 리로드 실패에 대한 로깅 또는 추가 처리
        console.warn(
          `DB 밴 추가 성공 (ID: ${banId}) 했으나 캐시 리로드 실패: ${reloadResult.error}`
        );
        // 실패해도 밴 자체는 성공했으므로 일단 성공으로 처리하거나, 별도 상태로 관리 가능
      }

      const session = await auth();
      if (session?.user) {
        const reasonShort =
          data.banreason.length > 10
            ? data.banreason.slice(0, 10) + "..."
            : data.banreason;
        const idsCount = data.identifiers.length;
        await logService.writeAdminLog(
          `${session.user.nickname} DB 밴 등록: 대상명=${data.name}, 사유=${reasonShort}, ids=${idsCount}개, id=${banId}`
        );
      }
      return { success: true, data: { id: banId, ...data }, error: null };
    } catch (error) {
      console.error("Error in addBanDirectlyToDb:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "DB 밴 등록 중 알 수 없는 에러",
      };
    }
  }

  // 하드밴 관리 메뉴에서 사용 (DB 직접 수정)
  async editBanDirectlyInDb(data: EditBanData) {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE dokku_hwidban SET user_id = ?, name = ?, banreason = ?, identifiers = ? WHERE id = ?",
        [
          data.user_id,
          data.name,
          data.banreason,
          JSON.stringify(data.identifiers),
          data.id,
        ]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          error: "수정할 밴 기록을 찾을 수 없습니다.",
          data: null,
        };
      }

      const reloadResult = await this.reloadHwidBanCache();
      if (!reloadResult.success) {
        console.warn(
          `DB 밴 수정 성공 (ID: ${data.id}) 했으나 캐시 리로드 실패: ${reloadResult.error}`
        );
      }

      const session = await auth();
      if (session?.user) {
        const reasonShort =
          data.banreason.length > 10
            ? data.banreason.slice(0, 10) + "..."
            : data.banreason;
        const idsCount = data.identifiers.length;
        await logService.writeAdminLog(
          `${session.user.nickname} DB 밴 수정: id=${data.id}, user_id=${
            data.user_id || "N/A"
          }, name=${data.name}, 사유=${reasonShort}, ids=${idsCount}개`
        );
      }
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Error in editBanDirectlyInDb:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "DB 밴 수정 중 알 수 없는 에러",
      };
    }
  }

  // 하드밴 관리 메뉴에서 사용 (DB 직접 삭제)
  // 명세: "Ban ID 제거 기능 - Ban 항목 삭제 시 동일 API 사용" -> 이 부분은 reloadHwidBanCache()를 의미하는 것으로 해석
  async deleteBanDirectlyFromDb(id: string) {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM dokku_hwidban WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          error: "삭제할 밴 기록을 찾을 수 없습니다.",
          data: null,
        };
      }

      const reloadResult = await this.reloadHwidBanCache();
      if (!reloadResult.success) {
        console.warn(
          `DB 밴 삭제 성공 (ID: ${id}) 했으나 캐시 리로드 실패: ${reloadResult.error}`
        );
      }

      const session = await auth();
      if (session?.user) {
        await logService.writeAdminLog(
          `${session.user.nickname} DB 밴 해제: id=${id}`
        );
      }
      return { success: true, data: { id }, error: null };
    } catch (error) {
      console.error("Error in deleteBanDirectlyFromDb:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "DB 밴 삭제 중 알 수 없는 에러",
      };
    }
  }
}

export const banService = new BanService();
