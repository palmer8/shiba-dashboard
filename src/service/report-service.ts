// import prisma from "@/db/prisma";
// import pool from "@/db/mysql";
// import { formatDate } from "@/lib/utils";
// import { RowDataPacket } from "mysql2";
// import {
//   IncidentReport,
//   WhitelistIP,
//   AddIncidentReportData,
//   EditIncidentReportData,
//   AddWhitelistData,
//   ReportFilters,
//   WhitelistFilters,
// } from "@/types/report";
// import { auth } from "@/lib/auth-config";
// import { GlobalReturn } from "@/types/global-return";

// type QueryResult<T> = {
//   records: T[];
//   count: number;
// };

// class BlockService {
//   async getIncidentReports(
//     page: number,
//     filters: ReportFilters
//   ): Promise<QueryResult<IncidentReport>> {
//     const pageSize = 50;
//     const offset = page * pageSize;

//     const whereClause = [];
//     const params: (string | number | Date)[] = [];

//     if (filters.penalty_type) {
//       whereClause.push("penalty_type LIKE ?");
//       params.push(`%${filters.penalty_type}%`);
//     }
//     if (filters.reason) {
//       whereClause.push("reason LIKE ?");
//       params.push(`%${filters.reason}%`);
//     }
//     if (filters.target_user_id) {
//       whereClause.push("target_user_id = ?");
//       params.push(Number(filters.target_user_id));
//     }
//     if (filters.reporting_user_id) {
//       whereClause.push("reporting_user_id = ?");
//       params.push(Number(filters.reporting_user_id));
//     }
//     if (filters.admin) {
//       whereClause.push("admin LIKE ?");
//       params.push(`%${filters.admin}%`);
//     }

//     if (filters.incident_time && Array.isArray(filters.incident_time)) {
//       const [fromDate, toDate] = filters.incident_time;
//       if (fromDate instanceof Date && toDate instanceof Date) {
//         whereClause.push("DATE(incident_time) BETWEEN ? AND ?");
//         params.push(
//           fromDate.toISOString().split("T")[0],
//           toDate.toISOString().split("T")[0]
//         );
//       }
//     }

//     const whereString =
//       whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

//     const [records, countResult] = await Promise.all([
//       pool.execute<RowDataPacket[]>(
//         `SELECT SQL_CALC_FOUND_ROWS * FROM dokku_incident_report ${whereString}
//          ORDER BY incident_time DESC LIMIT ? OFFSET ?`,
//         [...params, pageSize, offset]
//       ),
//       pool.execute<RowDataPacket[]>("SELECT FOUND_ROWS() as total"),
//     ]);

//     return {
//       records: records[0] as IncidentReport[],
//       count: countResult[0][0].total,
//     };
//   }

//   async getWhitelist(
//     page: number,
//     filters: WhitelistFilters
//   ): Promise<QueryResult<WhitelistIP>> {
//     const pageSize = 50;
//     const offset = page * pageSize;

//     const whereClause = [];
//     const params: (string | number | Date)[] = [];

//     if (filters.user_ip) {
//       whereClause.push("user_ip LIKE ?");
//       params.push(`%${filters.user_ip}%`);
//     }
//     if (filters.comment) {
//       whereClause.push("comment LIKE ?");
//       params.push(`%${filters.comment}%`);
//     }
//     if (filters.registrant) {
//       whereClause.push("registrant LIKE ?");
//       params.push(`%${filters.registrant}%`);
//     }

//     if (filters.date && Array.isArray(filters.date)) {
//       const [fromDate, toDate] = filters.date;
//       if (fromDate instanceof Date && toDate instanceof Date) {
//         whereClause.push("DATE(date) BETWEEN ? AND ?");
//         params.push(
//           fromDate.toISOString().split("T")[0],
//           toDate.toISOString().split("T")[0]
//         );
//       }
//     }

//     const whereString =
//       whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

//     const [records, countResult] = await Promise.all([
//       pool.execute<RowDataPacket[]>(
//         `SELECT SQL_CALC_FOUND_ROWS * FROM dokku_whitelist_ip ${whereString}
//          ORDER BY date DESC LIMIT ? OFFSET ?`,
//         [...params, pageSize, offset]
//       ),
//       pool.execute<RowDataPacket[]>("SELECT FOUND_ROWS() as total"),
//     ]);

//     return {
//       records: records[0] as WhitelistIP[],
//       count: countResult[0][0].total,
//     };
//   }

//   async addIncidentReport(
//     data: AddIncidentReportData
//   ): Promise<GlobalReturn<number>> {
//     const session = await auth();

//     if (!session || !session.user || !session.user.id) {
//       return {
//         success: false,
//         message: "세션이 없습니다.",
//         data: null,
//         error: null,
//       };
//     }

//     try {
//       const [result] = await pool.execute(
//         `INSERT INTO dokku_incident_report (
//           reason, incident_description, incident_time, target_user_id,
//           target_user_nickname, reporting_user_id, reporting_user_nickname,
//           penalty_type, warning_count, detention_time_minutes, ban_duration_hours, admin
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           data.reason,
//           data.incidentDescription,
//           formatDate(data.incidentTime),
//           data.targetUserId,
//           data.targetUserNickname,
//           data.reportingUserId,
//           data.reportingUserNickname,
//           data.penaltyType,
//           data.warningCount,
//           data.detentionTimeMinutes,
//           data.isTicket ? 72 : data.banDurationHours,
//           data.admin,
//         ]
//       );

//       await prisma.accountUsingQuerylog.create({
//         data: {
//           content: `사건 보고서 생성: ${data.targetUserNickname}(${data.targetUserId}) - ${data.reason}`,
//           registrantId: session?.user.id || "",
//         },
//       });

//       if (data.isTicket) {
//         await this.addBlockTicket((result as any).insertId, session.user.id);
//       }

//       return (result as any).insertId;
//     } catch (error) {
//       return {
//         success: false,
//         message: "사건 보고서 생성에 실패했습니다.",
//         data: null,
//         error: error,
//       };
//     }
//   }

//   async addWhiteList(data: {
//     user_ip: string[];
//     comment?: string;
//   }): Promise<GlobalReturn<number>> {
//     const session = await auth();

//     if (
//       !session ||
//       !session.user ||
//       !session.user.id ||
//       !session.user.nickname
//     ) {
//       return {
//         success: false,
//         message: "세션이 없습니다.",
//         data: null,
//         error: null,
//       };
//     }

//     const values = data.user_ip.map((ip) => [
//       ip,
//       data.comment,
//       session.user?.nickname,
//       new Date().toISOString().slice(0, 19).replace("T", " "),
//     ]);

//     try {
//       const [result] = await pool.execute(
//         `INSERT INTO dokku_whitelist_ip (user_ip, comment, registrant, date)
//          VALUES ${values.map(() => "(?, ?, ?, ?)").join(", ")}`,
//         values.flat()
//       );

//       await prisma.accountUsingQuerylog.create({
//         data: {
//           content: `화이트리스트 생성: ${data.user_ip.join(", ")}`,
//           registrantId: session.user.id,
//         },
//       });

//       return (result as any).insertId;
//     } catch (error: any) {
//       return {
//         success: false,
//         message: "화이트리스트 생성에 실패했습니다.",
//         data: null,
//         error: error,
//       };
//     }
//   }

//   async editIncidentReport(data: {
//     reportId: number;
//     reason: string;
//     incidentDescription: string;
//     incidentTime: Date;
//     penaltyType: string;
//     warningCount?: number | null;
//     detentionTimeMinutes?: number | null;
//     banDurationHours?: number | null;
//     admin: string;
//     userId: string;
//   }) {
//     try {
//       const [result] = await pool.execute(
//         `UPDATE dokku_incident_report
//          SET reason = ?, incident_description = ?, incident_time = ?,
//              penalty_type = ?, warning_count = ?, detention_time_minutes = ?,
//              ban_duration_hours = ?, admin = ?
//          WHERE report_id = ?`,
//         [
//           data.reason,
//           data.incidentDescription,
//           formatDate(data.incidentTime),
//           data.penaltyType,
//           data.warningCount,
//           data.detentionTimeMinutes,
//           data.banDurationHours,
//           data.admin,
//           data.reportId,
//         ]
//       );

//       await prisma.accountUsingQuerylog.create({
//         data: {
//           content: `사건 처리 보고서 수정: ${data.reportId}`,
//           registrantId: data.userId,
//         },
//       });

//       return { success: (result as any).affectedRows > 0 };
//     } catch (error) {
//       console.error("Edit incident report error:", error);
//       return { success: false, error: "사건 처리 보고서 수정에 실패했습니다." };
//     }
//   }

//   async deleteIncidentReport(reportId: number, userId: string) {
//     try {
//       const [result] = await pool.execute(
//         "DELETE FROM dokku_incident_report WHERE report_id = ?",
//         [reportId]
//       );

//       await prisma.accountUsingQuerylog.create({
//         data: {
//           content: `사건 처리 보고서 삭제: ${reportId}`,
//           registrantId: userId,
//         },
//       });

//       return { success: (result as any).affectedRows > 0 };
//     } catch (error) {
//       console.error("Delete incident report error:", error);
//       return { success: false, error: "사건 처리 보고서 삭제에 실패했습니다." };
//     }
//   }

//   async addBlockTicket(reportId: number, userId: string) {
//     const session = await auth();

//     if (!session || !session.user || !session.user.id) {
//       return {
//         success: false,
//         message: "세션이 없습니다.",
//         data: null,
//         error: null,
//       };
//     }

//     const result = await prisma.blockTicket.create({
//       data: {
//         reportId,
//         userId,
//       },
//     });
//   }
// }

// export const blockService = new BlockService();
