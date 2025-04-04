import pool from "@/db/mysql";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { UserRole } from "@prisma/client";
import { ApiResponse } from "@/types/global.dto";
import { redirect } from "next/navigation";
import { logService } from "./log-service";

export interface EmojiData {
  emoji: string;
  users: number[];
}

export interface EmojiResponse {
  success: boolean;
  data: EmojiData[] | null;
  error: string | null;
}

class EmojiService {
  /**
   * 모든 이모지와 사용자 목록을 가져옵니다.
   */
  async getAllEmojis(): Promise<EmojiResponse> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT emoji COLLATE utf8mb4_bin AS emoji,
         JSON_ARRAYAGG(user_id) AS users
         FROM dokku_coupleemojis
         GROUP BY emoji COLLATE utf8mb4_bin
         ORDER BY emoji`
      );

      // 결과 변환
      const emojis: EmojiData[] = rows.map((row) => ({
        emoji: row.emoji,
        users: JSON.parse(row.users),
      }));

      return {
        success: true,
        data: emojis,
        error: null,
      };
    } catch (error) {
      console.error("이모지 데이터 조회 에러:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "이모지 목록을 가져오는데 실패했습니다.",
      };
    }
  }

  /**
   * 이모지 데이터를 JSON 형태로 반출합니다.
   */
  async getEmojiJsonData(): Promise<ApiResponse<Record<string, number[]>>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const emojisResponse = await this.getAllEmojis();

      if (!emojisResponse.success || !emojisResponse.data) {
        return {
          success: false,
          data: null,
          error:
            emojisResponse.error || "이모지 데이터를 가져오는데 실패했습니다.",
        };
      }

      // 요청한 형식({이모지: [사용자ID배열]})으로 변환
      const jsonData = emojisResponse.data.reduce<Record<string, number[]>>(
        (acc, item) => {
          acc[item.emoji] = item.users;
          return acc;
        },
        {}
      );

      return {
        success: true,
        data: jsonData,
        error: null,
      };
    } catch (error) {
      console.error("이모지 JSON 데이터 변환 에러:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "이모지 데이터 변환에 실패했습니다.",
      };
    }
  }

  /**
   * 특정 사용자의 이모지를 가져옵니다.
   */
  async getUserEmojis(userId: number): Promise<ApiResponse<string[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT emoji FROM dokku_coupleemojis WHERE user_id = ?`,
        [userId]
      );

      const emojis = rows.map((row) => row.emoji);

      return {
        success: true,
        data: emojis,
        error: null,
      };
    } catch (error) {
      console.error("사용자 이모지 조회 에러:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "사용자 이모지를 가져오는데 실패했습니다.",
      };
    }
  }

  /**
   * 사용자에게 이모지를 추가합니다.
   */
  async addEmojiToUser(
    userId: number,
    emoji: string
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    if (!hasAccess(session.user.role, UserRole.MASTER)) {
      return {
        success: false,
        data: null,
        error: "이모지 추가 권한이 없습니다.",
      };
    }

    try {
      // 기존 이모지가 있는지 확인
      const [existing] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM dokku_coupleemojis WHERE user_id = ? AND emoji = ?`,
        [userId, emoji]
      );

      if (existing.length > 0) {
        return {
          success: false,
          data: null,
          error: "이미 해당 사용자에게 추가된 이모지입니다.",
        };
      }

      // 새로운 이모지 추가
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO dokku_coupleemojis (user_id, emoji) VALUES (?, ?)`,
        [userId, emoji]
      );

      await logService.writeAdminLog(
        `사용자 ${userId}에게 이모지 ${emoji} 추가`
      );

      return {
        success: result.affectedRows > 0,
        data: result.affectedRows > 0,
        error: null,
      };
    } catch (error) {
      console.error("이모지 추가 에러:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "이모지 추가에 실패했습니다.",
      };
    }
  }

  /**
   * 사용자로부터 이모지를 제거합니다.
   */
  async removeEmojiFromUser(
    userId: number,
    emoji: string
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    if (!hasAccess(session.user.role, UserRole.MASTER)) {
      return {
        success: false,
        data: null,
        error: "이모지 제거 권한이 없습니다.",
      };
    }

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM dokku_coupleemojis WHERE user_id = ? AND emoji = ?`,
        [userId, emoji]
      );

      await logService.writeAdminLog(
        `사용자 ${userId}로부터 이모지 ${emoji} 제거`
      );

      return {
        success: result.affectedRows > 0,
        data: result.affectedRows > 0,
        error:
          result.affectedRows > 0 ? null : "해당 이모지를 찾을 수 없습니다.",
      };
    } catch (error) {
      console.error("이모지 제거 에러:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "이모지 제거에 실패했습니다.",
      };
    }
  }
}

export const emojiService = new EmojiService();
