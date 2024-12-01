import pool from "@/db/mysql";
import { PaymentFilter } from "@/types/filters/payment-filter";
import { GlobalReturn } from "@/types/global-return";
import { Payment, PaymentDto } from "@/types/payment";
import { RowDataPacket } from "mysql2";

class PaymentService {
  async getPayment(params: PaymentFilter): Promise<GlobalReturn<PaymentDto>> {
    const page = params.page || 1;
    const pageSize = 50;
    const offset = (page - 1) * pageSize;

    const whereClause: string[] = [];
    const queryParams: (string | number | Date)[] = [];

    if (params.ip) {
      whereClause.push("ip LIKE ?");
      queryParams.push(`%${params.ip}%`);
    }
    if (params.price) {
      whereClause.push("price LIKE ?");
      queryParams.push(`%${params.price}%`);
    }
    if (params.email) {
      whereClause.push("email LIKE ?");
      queryParams.push(`%${params.email}%`);
    }
    if (params.date && Array.isArray(params.date)) {
      const [fromDate, toDate] = params.date;

      // 시작일은 해당일 00:00:00 (KST)
      const startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);

      // 종료일은 다음날 00:00:00 (KST) 직전
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);

      whereClause.push("date >= ? AND date <= ?");
      queryParams.push(startDate, endDate);
    }

    const whereString =
      whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

    try {
      // 전체 개수를 먼저 조회
      const [countResult] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM dokku_tebex_log ${whereString}`,
        queryParams
      );

      const total = countResult[0].total;

      // 페이지네이션된 데이터 조회
      const [records] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM dokku_tebex_log ${whereString} 
         ORDER BY date DESC LIMIT ? OFFSET ?`,
        [...queryParams, pageSize, offset]
      );

      return {
        success: true,
        message: "결제 내역 조회 성공",
        data: {
          items: (records as Payment[]).map((record) => ({
            ...record,
            date: new Date(record.date),
          })),
          total,
          page,
          totalPages: Math.ceil(total / pageSize),
        },
        error: null,
      };
    } catch (error) {
      console.error("Payment query error:", error);
      return {
        success: false,
        message: "결제 내역 조회 실패",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getPaymentByIdsToOrigin(ids: string[]) {
    const [result] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM dokku_tebex_log WHERE transid IN (?)",
      [ids]
    );

    return result;
  }
}

export const paymentService = new PaymentService();
