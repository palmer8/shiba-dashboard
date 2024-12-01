import pool from "@/db/mysql";
import { RowDataPacket } from "mysql2";
import { IncidentReport, ReportFilters } from "@/types/report";
import { GlobalReturn } from "@/types/global-return";

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
        whereClause.push("penalty_type LIKE ?");
        queryParams.push(`%${filters.penalty_type}%`);
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
}

export const reportService = new ReportService();
