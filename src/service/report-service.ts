import pool from "@/db/mysql";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  AddIncidentReportData,
  EditIncidentReportData,
  IncidentReport,
  ReportFilters,
  WhitelistFilters,
  WhitelistIP,
  AddWhitelistData,
  EditWhitelistData,
  AddBlockTicketData,
} from "@/types/report";
import { GlobalReturn } from "@/types/global-return";
import { formatKoreanDateTime } from "@/lib/utils";
import { auth } from "@/lib/auth-config";
import prisma from "@/db/prisma";

class ReportService {
  async getIncidentReports(filters: ReportFilters): Promise<
    GlobalReturn<{
      records: IncidentReport[];
      total: number;
      page: number;
      totalPages: number;
    }>
  > {
    try {
      const pageSize = 50;
      const page = filters.page || 1;
      const offset = (page - 1) * pageSize;

      const whereClause: string[] = [];
      const queryParams: (string | number | Date)[] = [];

      if (filters.penalty_type) {
        whereClause.push("penalty_type = ?");
        queryParams.push(filters.penalty_type);
      }
      if (filters.reason) {
        whereClause.push("reason LIKE ?");
        queryParams.push(`%${filters.reason}%`);
      }
      if (filters.target_user_id) {
        whereClause.push("target_user_id = ?");
        queryParams.push(Number(filters.target_user_id));
      }
      if (filters.reporting_user_id) {
        whereClause.push("reporting_user_id = ?");
        queryParams.push(Number(filters.reporting_user_id));
      }
      if (filters.admin) {
        whereClause.push("admin LIKE ?");
        queryParams.push(`%${filters.admin}%`);
      }

      if (filters.incident_time && Array.isArray(filters.incident_time)) {
        const [fromDate, toDate] = filters.incident_time;
        if (fromDate instanceof Date && toDate instanceof Date) {
          // 시작일은 해당일 00:00:00 (KST)
          const startDate = new Date(fromDate);
          startDate.setHours(0, 0, 0, 0);

          // 종료일은 다음날 00:00:00 (KST) 직전
          const endDate = new Date(toDate);
          endDate.setHours(23, 59, 59, 999);

          whereClause.push("incident_time >= ? AND incident_time <= ?");
          queryParams.push(startDate, endDate);
        }
      }

      const whereString =
        whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

      // 전체 개수를 먼저 조회
      const [countResult] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM dokku_incident_report ${whereString}`,
        queryParams
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / pageSize);

      // 페이지네이션된 데이터 조회 - queryParams 포함하여 전달
      const [records] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM dokku_incident_report ${whereString} 
         ORDER BY incident_time DESC LIMIT ? OFFSET ?`,
        [...queryParams, pageSize, offset]
      );

      return {
        success: true,
        message: "사건 처리 보고서 조회 성공",
        data: {
          records: records as IncidentReport[],
          total,
          page,
          totalPages,
        },
        error: null,
      };
    } catch (error) {
      console.error("Get incident reports error:", error);
      return {
        success: false,
        message: "사건 처리 보고서 조회 실패",
        data: {
          records: [],
          total: 0,
          page: filters.page || 1,
          totalPages: 1,
        },
        error,
      };
    }
  }

  async createIncidentReport(
    data: AddIncidentReportData
  ): Promise<GlobalReturn<number>> {
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        message: "세션이 없습니다",
        data: 0,
        error: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
        id: true,
        nickname: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "등록되지 않은 계정입니다",
        data: 0,
        error: null,
      };
    }

    if (user.role === "STAFF" && data.banDurationHours === -1) {
      try {
        const [result] = await pool.execute<ResultSetHeader>(
          `INSERT INTO dokku_incident_report (
            reason, incident_description, incident_time, 
            target_user_id, target_user_nickname,
            reporting_user_id, reporting_user_nickname,
            penalty_type, warning_count, detention_time_minutes,
            ban_duration_hours, admin
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.reason,
            data.incidentDescription,
            formatKoreanDateTime(data.incidentTime),
            data.targetUserId,
            data.targetUserNickname,
            data.reportingUserId,
            data.reportingUserNickname,
            "게임정지",
            data.warningCount,
            data.detentionTimeMinutes,
            72,
            user.nickname,
          ]
        );

        if (result.affectedRows > 0) {
          await prisma.blockTicket.create({
            data: {
              registrantId: user.id,
              reportId: result.insertId,
            },
          });
          return {
            success: true,
            message: "사건 처리 보고서 생성 성공",
            data: 1,
            error: null,
          };
        }
      } catch (error) {
        console.error("Create incident report error:", error);
        return {
          success: false,
          message: "사건 처리 보고서 생성 실패",
          data: 0,
          error,
        };
      }
    }

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO dokku_incident_report (
          reason, incident_description, incident_time, 
          target_user_id, target_user_nickname,
          reporting_user_id, reporting_user_nickname,
          penalty_type, warning_count, detention_time_minutes,
          ban_duration_hours, admin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.reason,
          data.incidentDescription,
          formatKoreanDateTime(data.incidentTime),
          data.targetUserId,
          data.targetUserNickname,
          data.reportingUserId,
          data.reportingUserNickname,
          data.penaltyType,
          data.warningCount,
          data.detentionTimeMinutes,
          data.banDurationHours,
          session?.user?.nickname,
        ]
      );

      return {
        success: true,
        message: "사건 처리 보고서 생성 성공",
        data: result.insertId,
        error: null,
      };
    } catch (error) {
      console.error("Create incident report error:", error);
      return {
        success: false,
        message: "사건 처리 보고서 생성 실패",
        data: 0,
        error,
      };
    }
  }

  async deleteIncidentReport(reportId: number): Promise<GlobalReturn<boolean>> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM dokku_incident_report WHERE report_id = ?",
        [reportId]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "사건 처리 보고서 삭제 성공"
            : "해당 보고서를 찾을 수 없습니다",
        data: result.affectedRows > 0,
        error: null,
      };
    } catch (error) {
      console.error("Delete incident report error:", error);
      return {
        success: false,
        message: "사건 처리 보고서 삭제 실패",
        data: false,
        error,
      };
    }
  }

  async getWhitelists(filters: WhitelistFilters): Promise<
    GlobalReturn<{
      records: WhitelistIP[];
      total: number;
      page: number;
      totalPages: number;
    }>
  > {
    try {
      const pageSize = 50;
      const page = filters.page || 1;
      const offset = (page - 1) * pageSize;

      const whereClause: string[] = [];
      const queryParams: (string | Date)[] = [];

      if (filters.user_ip) {
        whereClause.push("user_ip LIKE ?");
        queryParams.push(`%${filters.user_ip}%`);
      }
      if (filters.comment) {
        whereClause.push("comment LIKE ?");
        queryParams.push(`%${filters.comment}%`);
      }
      if (filters.registrant) {
        whereClause.push("registrant LIKE ?");
        queryParams.push(`%${filters.registrant}%`);
      }

      if (filters.date && Array.isArray(filters.date)) {
        const [fromDate, toDate] = filters.date;
        if (fromDate instanceof Date && toDate instanceof Date) {
          whereClause.push("date BETWEEN ? AND ?");
          queryParams.push(fromDate, toDate);
        }
      }

      const whereString =
        whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

      const [countResult] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM dokku_whitelist_ip ${whereString}`,
        queryParams
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / pageSize);

      const [records] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM dokku_whitelist_ip ${whereString} 
         ORDER BY date DESC LIMIT ? OFFSET ?`,
        [...queryParams, pageSize, offset]
      );

      return {
        success: true,
        message: "화이트리스트 조회 성공",
        data: {
          records: records as WhitelistIP[],
          total,
          page,
          totalPages,
        },
        error: null,
      };
    } catch (error) {
      console.error("Get whitelists error:", error);
      return {
        success: false,
        message: "화이트리스트 조회 실패",
        data: {
          records: [],
          total: 0,
          page: filters.page || 1,
          totalPages: 1,
        },
        error,
      };
    }
  }

  async createWhitelist(data: AddWhitelistData): Promise<GlobalReturn<number>> {
    try {
      const session = await auth();

      if (!session || !session.user) {
        return {
          success: false,
          message: "세션이 없습니다",
          data: null,
          error: null,
        };
      }

      const values = data.user_ip.map((ip) => [
        ip,
        data.status ?? 0,
        data.comment || null,
        session.user?.nickname,
        new Date(),
      ]);

      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO dokku_whitelist_ip (user_ip, status, comment, registrant, date) 
         VALUES (?, ?, ?, ?, ?)`,
        values[0]
      );

      // 첫 번째 이후의 IP들에 대해 추가 insert 실행
      if (values.length > 1) {
        for (let i = 1; i < values.length; i++) {
          await pool.execute<ResultSetHeader>(
            `INSERT INTO dokku_whitelist_ip (user_ip, status, comment, registrant, date)
             VALUES (?, ?, ?, ?, ?)`,
            values[i]
          );
        }
      }

      return {
        success: true,
        message: "IP 관리 티켓 생성 성공",
        data: result.insertId,
        error: null,
      };
    } catch (error) {
      console.error("Create whitelist error:", error);
      return {
        success: false,
        message: "IP 관리 티켓 생성 실패",
        data: null,
        error,
      };
    }
  }

  async deleteWhitelist(id: number): Promise<GlobalReturn<boolean>> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM dokku_whitelist_ip WHERE id = ?",
        [id]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "화이트리스트 삭제 성공"
            : "해당 화이트리스트를 찾을 수 없습니다",
        data: result.affectedRows > 0,
        error: null,
      };
    } catch (error) {
      console.error("Delete whitelist error:", error);
      return {
        success: false,
        message: "화이트리스트 삭제 실패",
        data: false,
        error,
      };
    }
  }

  async updateIncidentReport(
    data: EditIncidentReportData
  ): Promise<GlobalReturn<boolean>> {
    const session = await auth();

    if (!session?.user?.nickname) {
      return {
        success: false,
        message: "세션이 없습니다",
        data: false,
        error: null,
      };
    }

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE dokku_incident_report 
         SET reason = ?, 
             incident_description = ?,
             incident_time = ?,
             penalty_type = ?,
             warning_count = ?,
             ban_duration_hours = ?,
             target_user_id = ?,
             target_user_nickname = ?,
             reporting_user_id = ?,
             reporting_user_nickname = ?
         WHERE report_id = ?`,
        [
          data.reason,
          data.incidentDescription,
          formatKoreanDateTime(data.incidentTime),
          data.penaltyType,
          data.warningCount || null,
          data.banDurationHours || null,
          data.targetUserId,
          data.targetUserNickname,
          data.reportingUserId || null,
          data.reportingUserNickname || null,
          data.reportId,
        ]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "사건 처리 보고서 수정 성공"
            : "해당 보고서를 찾을 수 없습니다",
        data: result.affectedRows > 0,
        error: null,
      };
    } catch (error) {
      console.error("Update incident report error:", error);
      return {
        success: false,
        message: "사건 처리 보고서 수정 실패",
        data: false,
        error,
      };
    }
  }

  async updateWhitelist(
    data: EditWhitelistData
  ): Promise<GlobalReturn<boolean>> {
    try {
      const setClauses: string[] = [];
      const queryParams: (string | number)[] = [];

      if (data.user_ip !== undefined) {
        setClauses.push("user_ip = ?");
        queryParams.push(data.user_ip);
      }
      if (data.comment !== undefined) {
        setClauses.push("comment = ?");
        queryParams.push(data.comment);
      }
      if (data.status !== undefined) {
        setClauses.push("status = ?");
        queryParams.push(data.status);
      }

      if (setClauses.length === 0) {
        return {
          success: false,
          message: "수정할 내용이 없습니다",
          data: false,
          error: null,
        };
      }

      queryParams.push(data.id); // WHERE 절의 id 파라미터

      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE dokku_whitelist_ip 
         SET ${setClauses.join(", ")}
         WHERE id = ?`,
        queryParams
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "화이트리스트 수정 성공"
            : "해당 화이트리스트를 찾을 수 없습니다",
        data: result.affectedRows > 0,
        error: null,
      };
    } catch (error) {
      console.error("Update whitelist error:", error);
      return {
        success: false,
        message: "화이트리스트 수정 실패",
        data: false,
        error,
      };
    }
  }

  async createBlockTicket(
    data: AddBlockTicketData
  ): Promise<GlobalReturn<string>> {
    try {
      const result = await prisma.blockTicket.create({
        data: {
          registrantId: data.userId,
          reportId: data.reportId,
        },
      });

      return {
        success: true,
        message: "사건처리 보고 승인 생성 성공",
        data: result.id,
        error: null,
      };
    } catch (error) {
      console.error("Create block ticket error:", error);
      return {
        success: false,
        message: "사건처리 보고 승인 생성 실패",
        data: null,
        error,
      };
    }
  }

  async approveBlockTicketByIds(ids: string[]): Promise<GlobalReturn<number>> {
    const session = await auth();

    try {
      const result = await prisma.blockTicket.updateMany({
        where: { id: { in: ids }, status: "PENDING" },
        data: { status: "APPROVED", approverId: session?.user?.id },
      });

      return {
        success: true,
        message: `사건처리 보고 승인 ${ids.length}개 승인 성공`,
        data: ids.length,
        error: null,
      };
    } catch (error) {
      console.error("Approve block ticket error:", error);
      return {
        success: false,
        message: "사건처리 보고 승인 승인 실패",
        data: 0,
        error,
      };
    }
  }

  async approveAllBlockTicket(): Promise<GlobalReturn<boolean>> {
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        message: "세션이 없습니다",
        data: false,
        error: null,
      };
    }

    try {
      await prisma.blockTicket.updateMany({
        where: { status: "PENDING" },
        data: { status: "APPROVED", approverId: session?.user?.id },
      });

      return {
        success: true,
        message: "사건처리 보고 승인 전체 승인 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Approve all block ticket error:", error);
      return {
        success: false,
        message: "사건처리 보고 승인 전체 승인 실패",
        data: false,
        error,
      };
    }
  }

  async rejectBlockTicketByIds(ids: string[]): Promise<GlobalReturn<number>> {
    const session = await auth();

    try {
      await prisma.blockTicket.updateMany({
        where: { id: { in: ids }, status: "PENDING" },
        data: { status: "REJECTED", approverId: session?.user?.id },
      });

      return {
        success: true,
        message: `사건처리 보고 승인 ${ids.length}개 거절 성공`,
        data: ids.length,
        error: null,
      };
    } catch (error) {
      console.error("Reject block ticket error:", error);
      return {
        success: false,
        message: "사건처리 보고 승인 거절 실패",
        data: 0,
        error,
      };
    }
  }

  async rejectAllBlockTicket(): Promise<GlobalReturn<boolean>> {
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        message: "세션이 없습니다",
        data: false,
        error: null,
      };
    }

    try {
      await prisma.blockTicket.updateMany({
        where: { status: "PENDING" },
        data: { status: "REJECTED", approverId: session?.user?.id },
      });

      return {
        success: true,
        message: "사건처리 보고 승인 전체 거절 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Reject all block ticket error:", error);
      return {
        success: false,
        message: "사건처리 보고 승인 전체 거절 실패",
        data: false,
        error,
      };
    }
  }
}

export const reportService = new ReportService();
