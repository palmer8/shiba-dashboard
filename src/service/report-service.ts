import pool from "@/db/mysql";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  AddIncidentReportData,
  ReportFilters,
  WhitelistFilters,
  WhitelistIP,
  AddWhitelistData,
  EditWhitelistData,
  AddBlockTicketData,
  ReportActionResponse,
  BlockTicketActionResponse,
  WhitelistActionResponse,
  BlockTicketListResponse,
  WhitelistListResponse,
} from "@/types/report";
import { hasAccess } from "@/lib/utils";
import { auth } from "@/lib/auth-config";
import prisma from "@/db/prisma";
import { redirect } from "next/navigation";
import { BlockTicket, Status, UserRole } from "@prisma/client";
import { ApiResponse } from "@/types/global.dto";
import { logService } from "./log-service";
import { EditIncidentReportFormData } from "@/lib/validations/report";
import { realtimeService } from "./realtime-service";

class ReportService {
  async getIncidentReports(filters: ReportFilters): Promise<ApiResponse<any>> {
    const session = await auth();

    if (!session?.user) {
      return redirect("/login");
    }

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
          const startDate = new Date(fromDate);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(toDate);
          endDate.setHours(23, 59, 59, 999);

          whereClause.push("incident_time >= ? AND incident_time <= ?");
          queryParams.push(startDate, endDate);
        }
      }

      const whereString =
        whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

      const [countResult] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM dokku_incident_report ${whereString}`,
        queryParams
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / pageSize);

      const [records] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM dokku_incident_report ${whereString} 
         ORDER BY incident_time DESC LIMIT ? OFFSET ?`,
        [...queryParams, pageSize, offset]
      );

      const filterDescription = [];
      if (filters.penalty_type)
        filterDescription.push(`제재 유형: ${filters.penalty_type}`);
      if (filters.reason) filterDescription.push(`사유: ${filters.reason}`);
      if (filters.target_user_id)
        filterDescription.push(`대상 유저 ID: ${filters.target_user_id}`);
      if (filters.reporting_user_id)
        filterDescription.push(`신고자 ID: ${filters.reporting_user_id}`);
      if (filters.admin) filterDescription.push(`처리자: ${filters.admin}`);
      if (filters.incident_time)
        filterDescription.push(
          `처리 기간: ${filters.incident_time[0]} ~ ${filters.incident_time[1]}`
        );

      if (
        filterDescription.filter((desc) => !desc.includes("페이지")).length > 0
      ) {
        await logService.writeAdminLog(
          `사건 처리 보고서 조회 (${filterDescription
            .filter((desc) => !desc.includes("페이지"))
            .join(", ")})`
        );
      }

      return {
        success: true,
        data: {
          records,
          metadata: {
            total,
            page,
            totalPages,
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get incident reports error:", error);
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

  async createIncidentReport(
    data: AddIncidentReportData
  ): Promise<ReportActionResponse> {
    const session = await auth();

    if (!session?.user) {
      return redirect("/login");
    }

    try {
      // 스태프의 이용 정지 요청 처리
      if (session.user.role === "STAFF" && data.isBlockRequest) {
        const [result] = await pool.execute<ResultSetHeader>(
          `INSERT INTO dokku_incident_report (
            reason, incident_description, incident_time, 
            target_user_id, target_user_nickname,
            reporting_user_id, reporting_user_nickname,
            penalty_type, warning_count, detention_time_minutes,
            ban_duration_hours, admin, image
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.reason,
            data.incidentDescription,
            data.incidentTime,
            data.targetUserId,
            data.targetUserNickname,
            data.reportingUserId,
            data.reportingUserNickname,
            data.penaltyType,
            data.warningCount,
            data.detentionTimeMinutes,
            72, // 강제로 72시간 설정
            session.user.nickname,
            data.image,
          ]
        );

        if (result.affectedRows > 0) {
          await prisma.blockTicket.create({
            data: {
              registrantId: session.user.id,
              reportId: result.insertId,
            },
          });

          await logService.writeAdminLog(
            `사건 처리 보고서 작성 및 이용 정지 요청 : ${result.insertId}`
          );

          return {
            success: true,
            data: result.insertId,
            error: null,
          };
        }
      }
      // 관리자의 영구 정지 처리
      else if (
        hasAccess(session.user.role, UserRole.INGAME_ADMIN) &&
        data.isPermanentBlock
      ) {
        const [result] = await pool.execute<ResultSetHeader>(
          `INSERT INTO dokku_incident_report (
            reason, incident_description, incident_time, 
            target_user_id, target_user_nickname,
            reporting_user_id, reporting_user_nickname,
            penalty_type, warning_count, detention_time_minutes,
            ban_duration_hours, admin, image
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.reason,
            data.incidentDescription,
            data.incidentTime,
            data.targetUserId,
            data.targetUserNickname,
            data.reportingUserId,
            data.reportingUserNickname,
            data.penaltyType,
            data.warningCount,
            data.detentionTimeMinutes,
            -1, // 영구 정지로 설정
            session.user.nickname,
            data.image,
          ]
        );

        if (result.affectedRows > 0) {
          // 실시간 영구 정지 처리
          await realtimeService.playerBan(
            data.targetUserId,
            data.reason,
            "-1",
            "ban"
          );

          await logService.writeAdminLog(
            `사건 처리 보고서 작성 및 영구 정지 처리 : ${result.insertId}`
          );

          return {
            success: true,
            data: result.insertId,
            error: null,
          };
        }
      }

      // 일반 처리
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO dokku_incident_report (
          reason, incident_description, incident_time, 
          target_user_id, target_user_nickname,
          reporting_user_id, reporting_user_nickname,
          penalty_type, warning_count, detention_time_minutes,
          ban_duration_hours, admin, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.reason,
          data.incidentDescription,
          data.incidentTime,
          data.targetUserId,
          data.targetUserNickname,
          data.reportingUserId,
          data.reportingUserNickname,
          data.penaltyType,
          data.warningCount,
          data.detentionTimeMinutes,
          data.banDurationHours,
          session.user.nickname,
          data.image,
        ]
      );

      await logService.writeAdminLog(
        `사건 처리 보고서 작성 : ${result.insertId}`
      );

      return {
        success: true,
        data: result.insertId,
        error: null,
      };
    } catch (error) {
      console.error("Create incident report error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      };
    }
  }

  async deleteIncidentReport(reportId: number): Promise<ReportActionResponse> {
    const session = await auth();

    if (!session?.user) {
      return redirect("/login");
    }

    if (!hasAccess(session.user.role, UserRole.INGAME_ADMIN)) {
      return {
        success: false,
        data: null,
        error: "권한이 없습니다",
      };
    }

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM dokku_incident_report WHERE report_id = ?",
        [reportId]
      );

      await logService.writeAdminLog(`사건 처리 보고서 삭제 : ${reportId}`);

      return {
        success: result.affectedRows > 0,
        data: result.affectedRows > 0 ? reportId : null,
        error:
          result.affectedRows > 0 ? null : "해당 보고서를 찾을 수 없습니다",
      };
    } catch (error) {
      console.error("Delete incident report error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async updateIncidentReport(
    data: EditIncidentReportFormData
  ): Promise<ReportActionResponse> {
    const session = await auth();

    if (!session?.user) {
      return redirect("/login");
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 기존 보고서 조회
      const [existingReport] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM dokku_incident_report WHERE report_id = ?`,
        [data.reportId]
      );

      if (!existingReport[0]) {
        throw new Error("보고서를 찾을 수 없습니다.");
      }

      // 스태프의 이용 정지 요청 처리
      if (session.user.role === "STAFF" && data.isBlockRequest) {
        // 보고서 업데이트 (72시간으로 설정)
        await connection.execute(
          `UPDATE dokku_incident_report SET
            reason = ?, incident_description = ?, incident_time = ?,
            target_user_id = ?, target_user_nickname = ?,
            reporting_user_id = ?, reporting_user_nickname = ?,
            penalty_type = ?, warning_count = ?,
            detention_time_minutes = ?, ban_duration_hours = ?,
            admin = ?, image = ?
          WHERE report_id = ?`,
          [
            data.reason,
            data.incidentDescription,
            data.incidentTime,
            data.targetUserId,
            data.targetUserNickname,
            data.reportingUserId || null,
            data.reportingUserNickname || null,
            data.penaltyType,
            data.warningCount || null,
            data.detentionTimeMinutes || null,
            72, // 강제로 72시간 설정
            session.user.nickname,
            data.image || null,
            data.reportId,
          ]
        );

        // BlockTicket 생성
        await prisma.blockTicket.create({
          data: {
            registrantId: session.user.id,
            reportId: data.reportId,
          },
        });

        await logService.writeAdminLog(
          `사건 처리 보고서 수정 및 이용 정지 요청 : ${data.reportId}`
        );
      }
      // 관리자의 영구 정지 처리
      else if (
        hasAccess(session.user.role, UserRole.INGAME_ADMIN) &&
        data.isPermanentBlock
      ) {
        // 보고서 업데이트
        await connection.execute(
          `UPDATE dokku_incident_report SET
            reason = ?, incident_description = ?, incident_time = ?,
            target_user_id = ?, target_user_nickname = ?,
            reporting_user_id = ?, reporting_user_nickname = ?,
            penalty_type = ?, warning_count = ?,
            detention_time_minutes = ?, ban_duration_hours = ?,
            admin = ?, image = ?
          WHERE report_id = ?`,
          [
            data.reason,
            data.incidentDescription,
            data.incidentTime,
            data.targetUserId,
            data.targetUserNickname,
            data.reportingUserId || null,
            data.reportingUserNickname || null,
            data.penaltyType,
            data.warningCount || null,
            data.detentionTimeMinutes || null,
            -1, // 영구 정지로 설정
            session.user.nickname,
            data.image || null,
            data.reportId,
          ]
        );

        const result = await realtimeService.playerBan(
          data.targetUserId,
          data.reason,
          "-1", // 영구정지
          "ban"
        );

        console.log(result);

        if (!result.success) {
          throw new Error("banned API failed");
        }

        await logService.writeAdminLog(
          `사건 처리 보고서 수정 및 영구 정지 처리 : ${data.reportId}`
        );
      } else {
        // 일반 수정 처리
        await connection.execute(
          `UPDATE dokku_incident_report SET
            reason = ?, incident_description = ?, incident_time = ?,
            target_user_id = ?, target_user_nickname = ?,
            reporting_user_id = ?, reporting_user_nickname = ?,
            penalty_type = ?, warning_count = ?,
            detention_time_minutes = ?, ban_duration_hours = ?,
            admin = ?, image = ?
          WHERE report_id = ?`,
          [
            data.reason,
            data.incidentDescription,
            data.incidentTime,
            data.targetUserId,
            data.targetUserNickname,
            data.reportingUserId || null,
            data.reportingUserNickname || null,
            data.penaltyType,
            data.warningCount || null,
            data.detentionTimeMinutes || null,
            data.banDurationHours || null,
            session.user.nickname,
            data.image || null,
            data.reportId,
          ]
        );

        await logService.writeAdminLog(
          `사건 처리 보고서 수정 : ${data.reportId}`
        );
      }

      await connection.commit();
      return {
        success: true,
        data: data.reportId,
        error: null,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Update incident report error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      };
    } finally {
      connection.release();
    }
  }

  async getWhitelists(
    filters: WhitelistFilters
  ): Promise<WhitelistListResponse> {
    const session = await auth();

    if (!session?.user) {
      return redirect("/login");
    }

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

      await logService.writeAdminLog(
        `IP 관리 데이터 조회${
          whereClause.length > 0 ? ` : ${whereClause.join(" AND ")}` : " : 전체"
        }`
      );

      return {
        success: true,
        data: {
          records: records as WhitelistIP[],
          metadata: {
            total,
            page,
            totalPages,
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get whitelists error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async createWhitelist(
    data: AddWhitelistData
  ): Promise<WhitelistActionResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return redirect("/login");
      }

      if (
        !data?.user_ip ||
        !Array.isArray(data.user_ip) ||
        data.user_ip.length === 0
      ) {
        return {
          success: false,
          data: null,
          error: "유효하지 않은 IP 데이터입니다.",
        };
      }

      // 모든 IP에 대한 values 배열 생성
      const values = data.user_ip.map((ip) => [
        ip,
        data.status ?? 0,
        data.comment || null,
        session.user!.nickname,
        new Date(),
      ]);

      await pool.execute<ResultSetHeader>(
        `INSERT INTO dokku_whitelist_ip (user_ip, status, comment, registrant, date) 
         VALUES ${values.map(() => "(?, ?, ?, ?, ?)").join(", ")}`,
        values.flat()
      );

      // 로그 기록
      await prisma.accountUsingQuerylog.createMany({
        data: {
          content: `IP 관리 데이터 추가 : ${data.user_ip.join(", ")} ${
            data.comment || ""
          } ${data.status || 0}`,
          registrantId: session.user!.id as string,
        },
      });

      return {
        success: true,
        data: values.length,
        error: null,
      };
    } catch (error) {
      console.error("Create whitelist error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async updateWhitelist(
    data: EditWhitelistData
  ): Promise<WhitelistActionResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return redirect("/login");
      }

      const setClauses: string[] = [];
      const queryParams: (string | number | null)[] = [];

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
          data: null,
          error: "수정할 내용이 없습니다",
        };
      }

      queryParams.push(data.id); // WHERE 절의 id 파라미터

      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE dokku_whitelist_ip 
         SET ${setClauses.join(", ")}
         WHERE id = ?`,
        queryParams
      );

      await logService.writeAdminLog(
        `IP 관리 데이터 수정 : ${data.user_ip} ${data.id}`
      );

      return {
        success: result.affectedRows > 0,
        data: result.affectedRows > 0 ? data.id : null,
        error:
          result.affectedRows > 0
            ? null
            : "해당 화이트리스트를 찾을 수 없습니다",
      };
    } catch (error) {
      console.error("Update whitelist error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async deleteWhitelist(id: number): Promise<WhitelistActionResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return redirect("/login");
      }

      const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM dokku_whitelist_ip WHERE id = ?",
        [id]
      );

      await logService.writeAdminLog(`IP 관리 데이터 삭제 : ${id}`);

      return {
        success: result.affectedRows > 0,
        data: result.affectedRows > 0 ? id : null,
        error:
          result.affectedRows > 0
            ? null
            : "해당 화이트리스트를 찾을 수 없습니다",
      };
    } catch (error) {
      console.error("Delete whitelist error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async createBlockTicket(
    data: AddBlockTicketData
  ): Promise<BlockTicketActionResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return redirect("/login");
      }

      const result = await prisma.blockTicket.create({
        data: {
          registrantId: session.user.id,
          reportId: data.reportId,
        },
      });

      return {
        success: true,
        data: Number(result.id),
        error: null,
      };
    } catch (error) {
      console.error("Create block ticket error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async deleteBlockTicket(
    ticketId: string
  ): Promise<BlockTicketActionResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return redirect("/login");
      }

      if (!hasAccess(session.user.role, UserRole.INGAME_ADMIN)) {
        return {
          success: false,
          data: null,
          error: "권한이 없습니다",
        };
      }

      const result = await prisma.blockTicket.delete({
        where: { id: ticketId },
      });

      return {
        success: true,
        data: Number(result.id),
        error: null,
      };
    } catch (error) {
      console.error("Delete block ticket error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async getBlockTickets(
    page: number,
    filters: {
      status: Status;
      startDate?: string;
      endDate?: string;
      approveStartDate?: string;
      approveEndDate?: string;
      userId?: number;
    }
  ): Promise<BlockTicketListResponse> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const pageSize = 50;
      const skip = (page - 1) * pageSize;

      const [blockTickets, total] = await Promise.all([
        prisma.blockTicket.findMany({
          where: {
            status: filters.status,
            ...(filters.startDate &&
              filters.endDate && {
                createdAt: {
                  gte: new Date(filters.startDate),
                  lte: new Date(filters.endDate),
                },
              }),
            ...(filters.approveStartDate &&
              filters.approveEndDate && {
                approvedAt: {
                  gte: new Date(filters.approveStartDate),
                  lte: new Date(filters.approveEndDate),
                },
              }),
            ...(filters.userId && { userId: filters.userId }),
          },
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: {
                id: true,
                nickname: true,
                userId: true,
              },
            },
          },
        }),
        prisma.blockTicket.count({
          where: {
            status: filters.status,
            ...(filters.startDate &&
              filters.endDate && {
                createdAt: {
                  gte: new Date(filters.startDate),
                  lte: new Date(filters.endDate),
                },
              }),
            ...(filters.approveStartDate &&
              filters.approveEndDate && {
                approvedAt: {
                  gte: new Date(filters.approveStartDate),
                  lte: new Date(filters.approveEndDate),
                },
              }),
            ...(filters.userId && { userId: filters.userId }),
          },
        }),
      ]);

      // reportId 목록 추출
      const reportIds = blockTickets.map((ticket) => ticket.reportId);

      let reportsMap: Record<number, any> = {};

      // reportIds가 있을 때만 MySQL 쿼리 실행
      if (reportIds.length > 0) {
        const [reports] = await pool.query(
          `SELECT 
            report_id,
            target_user_id,
            target_user_nickname,
            reporting_user_id,
            reporting_user_nickname,
            reason,
            incident_time,
            ban_duration_hours,
            incident_description
           FROM dokku_incident_report 
           WHERE report_id IN (?)`,
          [reportIds]
        );

        reportsMap = (reports as any[]).reduce((acc, report) => {
          acc[report.report_id] = report;
          return acc;
        }, {} as Record<number, any>);
      }

      const enrichedTickets = blockTickets.map((ticket) => ({
        ...ticket,
        report: reportsMap[ticket.reportId] || null,
        registrant: ticket.registrant as any,
      }));

      return {
        success: true,
        data: {
          records: enrichedTickets,
          metadata: {
            total,
            page,
            totalPages: Math.ceil(total / pageSize),
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get block tickets error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async approveBlockTicketByIds(
    ticketIds: string[]
  ): Promise<BlockTicketActionResponse> {
    const session = await auth();

    if (!session?.user) {
      return redirect("/login");
    }

    if (!hasAccess(session.user.role, UserRole.INGAME_ADMIN)) {
      return {
        success: false,
        data: null,
        error: "권한이 없습니다",
      };
    }

    try {
      // 승인된 티켓들의 report_id 가져오기
      const tickets = await prisma.blockTicket.findMany({
        where: {
          id: {
            in: ticketIds,
          },
        },
        select: {
          reportId: true,
        },
      });

      // MySQL 트랜잭션 시작
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const [reports] = await connection.query(
          `SELECT 
            report_id,
            target_user_id,
            target_user_nickname,
            reporting_user_id,
            reporting_user_nickname,
            reason,
            incident_time,
            ban_duration_hours,
            incident_description,
            admin,
            image
           FROM dokku_incident_report 
           WHERE report_id IN (?)`,
          [tickets.map((ticket) => ticket.reportId)]
        );

        // 각 티켓에 대해 처리
        for (const ticket of tickets) {
          // 현재 티켓의 reportId와 일치하는 신고 데이터 찾기
          const matchingReport = (reports as any[]).find(
            (report) => report.report_id === ticket.reportId
          );

          if (!matchingReport) {
            throw new Error(`Report not found for ticket ${ticket.reportId}`);
          }

          // dokku_incident_report 업데이트
          await connection.execute(
            `UPDATE dokku_incident_report 
             SET ban_duration_hours = -1 
             WHERE report_id = ?`,
            [ticket.reportId]
          );

          await connection.execute(
            `UPDATE vrp_users
             SET banned = 1,
             bantime = "영구정지",
             banreason = ?,
             banadmin = ?
             WHERE id = ?`,
            [
              matchingReport.reason,
              matchingReport.admin,
              matchingReport.target_user_id,
            ]
          );
        }

        // 트랜잭션 커밋
        await connection.commit();
      } catch (error) {
        // 에러 발생시 롤백
        await connection.rollback();
        return {
          data: null,
          error: "트랜잭션 중 에러가 발생하였습니다.",
          success: false,
        };
      } finally {
        connection.release();
      }

      await prisma.$transaction([
        prisma.blockTicket.updateMany({
          where: { id: { in: ticketIds } },
          data: {
            status: "APPROVED",
            approverId: session.user.id,
            approvedAt: new Date(),
          },
        }),
        prisma.accountUsingQuerylog.create({
          data: {
            content: `사건처리 보고 승인 : ${ticketIds.join(", ")}`,
            registrantId: session.user.id as string,
          },
        }),
      ]);

      return {
        success: true,
        data: ticketIds.length,
        error: null,
      };
    } catch (error) {
      console.error("Approve block tickets error:", error);
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

  async approveAllBlockTicket(): Promise<BlockTicketActionResponse> {
    const session = await auth();

    if (!session?.user) {
      return redirect("/login");
    }

    if (!hasAccess(session.user.role, UserRole.INGAME_ADMIN)) {
      return {
        success: false,
        data: null,
        error: "권한이 없습니다",
      };
    }

    try {
      // 대기중인 모든 티켓 조회
      const pendingTickets = await prisma.blockTicket.findMany({
        where: { status: "PENDING" },
        select: { reportId: true },
      });

      if (pendingTickets.length === 0) {
        return {
          success: true,
          data: 0,
          error: null,
        };
      }

      // MySQL 트랜잭션 시작
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const [reports] = await connection.query(
          `SELECT 
            report_id,
            target_user_id,
            target_user_nickname,
            reporting_user_id,
            reporting_user_nickname,
            reason,
            incident_time,
            ban_duration_hours,
            incident_description,
            admin
           FROM dokku_incident_report 
           WHERE report_id IN (?)`,
          [pendingTickets.map((ticket) => ticket.reportId)]
        );

        // 각 티켓에 대해 처리
        for (const ticket of pendingTickets) {
          const matchingReport = (reports as any[]).find(
            (report) => report.report_id === ticket.reportId
          );

          if (!matchingReport) {
            throw new Error(`Report not found for ticket ${ticket.reportId}`);
          }

          // dokku_incident_report 업데이트
          await connection.execute(
            `UPDATE dokku_incident_report 
             SET ban_duration_hours = -1 
             WHERE report_id = ?`,
            [ticket.reportId]
          );

          // vrp_users 업데이트
          await connection.execute(
            `UPDATE vrp_users
             SET banned = 1,
             bantime = "영구정지",
             banreason = ?,
             banadmin = ?
             WHERE id = ?`,
            [
              matchingReport.reason,
              matchingReport.admin,
              matchingReport.target_user_id,
            ]
          );
        }

        // 트랜잭션 커밋
        await connection.commit();
      } catch (error) {
        // 에러 발생시 롤백
        await connection.rollback();
        return {
          data: null,
          error: "트랜잭션 중 에러가 발생하였습니다.",
          success: false,
        };
      } finally {
        connection.release();
      }

      await prisma.$transaction([
        prisma.blockTicket.updateMany({
          where: { status: "PENDING" },
          data: {
            status: "APPROVED",
            approverId: session.user.id,
            approvedAt: new Date(),
          },
        }),
        prisma.accountUsingQuerylog.createMany({
          data: {
            content: `사건처리 보고 승인 : ${pendingTickets
              .map((ticket) => ticket.reportId)
              .join(", ")}`,
            registrantId: session.user!.id as string,
          },
        }),
      ]);

      return {
        success: true,
        data: pendingTickets.length,
        error: null,
      };
    } catch (error) {
      console.error("Approve all block tickets error:", error);
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

  async rejectBlockTicketByIds(
    ids: string[]
  ): Promise<BlockTicketActionResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return redirect("/login");
      }

      if (!hasAccess(session.user.role, UserRole.INGAME_ADMIN)) {
        return {
          success: false,
          data: null,
          error: "권한이 없습니다",
        };
      }

      await prisma.$transaction([
        prisma.blockTicket.updateMany({
          where: {
            id: { in: ids },
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
            approverId: session.user.id,
          },
        }),
        prisma.accountUsingQuerylog.createMany({
          data: {
            content: `사건처리 보고 거절 : ${ids.join(", ")}`,
            registrantId: session.user!.id as string,
          },
        }),
      ]);

      return {
        success: true,
        data: ids.length,
        error: null,
      };
    } catch (error) {
      console.error("Reject block tickets error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async rejectAllBlockTicket(): Promise<BlockTicketActionResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return redirect("/login");
      }

      if (!hasAccess(session.user.role, UserRole.INGAME_ADMIN)) {
        return {
          success: false,
          data: null,
          error: "권한이 없습니다",
        };
      }

      const pendingTickets = await prisma.blockTicket.findMany({
        where: { status: "PENDING" },
      });

      await prisma.$transaction([
        prisma.blockTicket.updateMany({
          where: {
            id: {
              in: pendingTickets.map((ticket) => ticket.id),
            },
          },
          data: {
            status: "REJECTED",
            approverId: session.user.id,
          },
        }),
        prisma.accountUsingQuerylog.create({
          data: {
            content: `사건처리 보고 거절 : ${pendingTickets
              .map((ticket) => ticket.reportId)
              .join(", ")}`,
            registrantId: session.user!.id as string,
          },
        }),
      ]);

      return {
        success: true,
        data: pendingTickets.length,
        error: null,
      };
    } catch (error) {
      console.error("Reject all block tickets error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async getBlockTicketByIdsOrigin(
    ids: string[]
  ): Promise<ApiResponse<BlockTicket[]>> {
    const session = await auth();

    if (!session || !session.user) return redirect("/login");

    try {
      const result = await prisma.blockTicket.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return {
        error: null,
        data: result,
        success: true,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했습니다.",
        data: null,
        success: false,
      };
    }
  }

  async getIncidentReportsByTargetUserId(
    targetUserId: number
  ): Promise<ApiResponse<any>> {
    const session = await auth();

    if (!session?.user) {
      return redirect("/login");
    }

    try {
      // 최근 10개의 제재 이력만 가져오도록 설정
      const [records] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          report_id,
          reason,
          incident_description,
          incident_time,
          target_user_id,
          target_user_nickname,
          reporting_user_id,
          reporting_user_nickname,
          penalty_type,
          warning_count,
          detention_time_minutes,
          ban_duration_hours,
          admin,
          image,
          report_time
        FROM dokku_incident_report 
        WHERE target_user_id = ? 
        ORDER BY incident_time DESC`,
        [targetUserId]
      );

      return {
        success: true,
        data: {
          records,
          metadata: {
            total: records.length,
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get incident reports by target user ID error:", error);
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

  async getBlockTicketByReportId(
    reportId: number
  ): Promise<ApiResponse<BlockTicket | null>> {
    const session = await auth();

    if (!session?.user) {
      return redirect("/login");
    }

    try {
      const blockTicket = await prisma.blockTicket.findFirst({
        where: {
          reportId: reportId,
        },
      });

      return {
        success: true,
        data: blockTicket,
        error: null,
      };
    } catch (error) {
      console.error("Get block ticket by report ID error:", error);
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
}

export const reportService = new ReportService();
