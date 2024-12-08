import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { boardService } from "@/service/board-service";
import pool from "@/db/mysql";
import { RowDataPacket } from "mysql2/promise";
import { DashboardData } from "@/types/user";

async function getRealtimeUser() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const realtimeUserCountResponse = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/getPlayersCount`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
        signal: controller.signal,
        cache: "no-store",
      }
    );

    clearTimeout(timeoutId);

    if (!realtimeUserCountResponse.ok) {
      throw new Error(
        `HTTP error! status: ${realtimeUserCountResponse.status}`
      );
    }

    const realtimeUserCountData = await realtimeUserCountResponse.json();

    // 성공 시 쿠키에 저장
    (await cookies()).set(
      "lastRealtimeUserCount",
      JSON.stringify({
        count: realtimeUserCountData.playerNum || 0,
        timestamp: Date.now(),
      }),
      { maxAge: 3600 }
    );

    return realtimeUserCountData.playerNum || 0;
  } catch (error) {
    // 쿠키에서 최근 데이터 확인
    const lastData = (await cookies()).get("lastRealtimeUserCount");
    if (lastData) {
      const parsedData = JSON.parse(lastData.value);
      return parsedData.count;
    }
    return 0;
  }
}

async function getAdminData() {
  try {
    const adminDataResponse = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/getAdmin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
      }
    );

    const adminData = await adminDataResponse.json();

    // 성공 시 쿠키에 저장
    (await cookies()).set(
      "lastAdminData",
      JSON.stringify({
        data: adminData,
        timestamp: Date.now(),
      }),
      { maxAge: 3600 }
    );

    return adminData;
  } catch (error) {
    // 쿠키에서 최근 데이터 확인
    const lastData = (await cookies()).get("lastAdminData");
    if (lastData) {
      const parsedData = JSON.parse(lastData.value);
      return parsedData.data;
    }
    return { count: 0, users: [] };
  }
}

async function getWeeklyNewUsersStats() {
  try {
    const query = `
      WITH RECURSIVE dates AS (
        SELECT CURDATE() as date
        UNION ALL
        SELECT DATE_SUB(date, INTERVAL 1 DAY)
        FROM dates
        WHERE DATE_SUB(date, INTERVAL 1 DAY) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      ),
      daily_counts AS (
        SELECT 
          DATE(first_join) as join_date,
          COUNT(*) as user_count
        FROM vrp_user_identities
        WHERE first_join >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(first_join)
      )
      SELECT 
        dates.date,
        COALESCE(daily_counts.user_count, 0) as count,
        COALESCE(
          ROUND(
            CASE 
              WHEN prev_day.user_count = 0 THEN 0
              ELSE ((daily_counts.user_count - prev_day.user_count) / prev_day.user_count * 100)
            END, 
            1
          ),
          0
        ) as change_percentage
      FROM dates
      LEFT JOIN daily_counts ON dates.date = daily_counts.join_date
      LEFT JOIN daily_counts prev_day ON dates.date = DATE_ADD(prev_day.join_date, INTERVAL 1 DAY)
      ORDER BY dates.date DESC;
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query);

    return rows.map((row) => ({
      date: new Date(row.date).toISOString().split("T")[0],
      count: Number(row.count),
      changePercentage: Number(row.change_percentage),
    }));
  } catch (error) {
    return [];
  }
}

export async function GET() {
  try {
    const [userCount, adminData, recentBoards, weeklyStats] = await Promise.all(
      [
        getRealtimeUser(),
        getAdminData(),
        boardService.getRecentBoards(),
        getWeeklyNewUsersStats(),
      ]
    );

    const dashboardData: DashboardData = {
      userCount,
      adminData,
      recentBoards: recentBoards.data || {
        recentBoards: [],
        recentNotices: [],
      },
      weeklyStats,
    };

    return NextResponse.json({
      status: 200,
      message: "대시보드 데이터를 성공적으로 조회했습니다.",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "대시보드 데이터 조회에 실패했습니다.",
        error: "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
