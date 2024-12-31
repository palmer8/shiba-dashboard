import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import {
  AdminAttendance,
  AttendanceResponse,
  WorkHoursData,
} from "@/types/attendance";
import { addDays, startOfWeek, endOfWeek } from "date-fns";

// 전체 관리자 출퇴근 현황 조회
export async function GET(): Promise<NextResponse<AttendanceResponse>> {
  try {
    const attendances = await prisma.attendance.findMany({
      include: {
        checkIns: {
          orderBy: { timestamp: "desc" },
        },
        checkOuts: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    const formattedData: AdminAttendance[] = await Promise.all(
      attendances.map(async (attendance) => {
        // 주간 통계 계산
        const today = new Date();
        const weekStart = startOfWeek(today);
        const weekEnd = endOfWeek(today);

        // 근무 기록을 WorkHoursData 형식으로 변환
        const workHours: WorkHoursData = {};
        attendance.checkIns.forEach((checkIn, index) => {
          const date = checkIn.timestamp.toISOString().split("T")[0];
          if (!workHours[date]) workHours[date] = [];

          workHours[date].push({
            startTime: checkIn.timestamp.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            endTime:
              attendance.checkOuts[index]?.timestamp.toLocaleTimeString(
                "ko-KR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }
              ) || null,
          });
        });

        return {
          userId: attendance.userId,
          nickname: attendance.nickname,
          today: {
            in: attendance.checkIns[0]?.timestamp.toISOString() || null,
            out: attendance.checkOuts[0]?.timestamp.toISOString() || null,
          },
          records: attendance.checkIns.map((checkIn, index) => ({
            date: checkIn.timestamp.toISOString().split("T")[0],
            in: checkIn.timestamp.toISOString(),
            out: attendance.checkOuts[index]?.timestamp.toISOString() || null,
          })),
          weeklyStats: [], // 주간 통계 계산 로직 필요
          workHours,
        };
      })
    );

    return NextResponse.json({
      success: true,
      error: null,
      data: formattedData,
    });
  } catch (error) {
    console.error("출퇴근 조회 에러:", error);
    return NextResponse.json(
      {
        success: false,
        error: "출퇴근 기록을 조회하는데 실패했습니다",
        data: null,
      },
      { status: 500 }
    );
  }
}

// 여러 관리자의 출퇴근 데이터 일괄 등록
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 데이터 유효성 검사
    if (!Array.isArray(data.records)) {
      return NextResponse.json(
        {
          success: false,
          error: "잘못된 데이터 형식입니다",
          data: null,
        },
        { status: 400 }
      );
    }

    // 최대 10명까지만 처리
    if (data.records.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "처리할 수 있는 최대 관리자 수(10명)를 초과했습니다",
          data: null,
        },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      data.records.map(async (record: any) => {
        // 필수 필드 검사
        if (
          !record.userId ||
          !record.nickname ||
          !Array.isArray(record.checkIns)
        ) {
          throw new Error(`유효하지 않은 레코드: ${JSON.stringify(record)}`);
        }

        // 1. Attendance 레코드 생성 또는 업데이트
        const attendance = await prisma.attendance.upsert({
          where: { userId: record.userId },
          create: { userId: record.userId, nickname: record.nickname },
          update: { nickname: record.nickname },
        });

        // 2. 체크인 처리
        const processedCheckIns = await Promise.all(
          record.checkIns.map(async (timestamp: string) => {
            const checkInTime = new Date(timestamp);

            // 같은 시간대의 체크인이 있는지 확인 (5분 이내 중복 방지)
            const existingCheckIn = await prisma.checkIn.findFirst({
              where: {
                attendanceId: attendance.id,
                timestamp: {
                  gte: new Date(checkInTime.getTime() - 5 * 60000),
                  lte: new Date(checkInTime.getTime() + 5 * 60000),
                },
              },
            });

            if (!existingCheckIn) {
              return prisma.checkIn.create({
                data: {
                  attendanceId: attendance.id,
                  timestamp: checkInTime,
                },
              });
            }
            return null;
          })
        );

        // 3. 체크아웃 처리
        const processedCheckOuts = await Promise.all(
          (record.checkOuts || []).map(async (timestamp: string) => {
            const checkOutTime = new Date(timestamp);

            // 같은 시간대의 체크아웃이 있는지 확인 (5분 이내 중복 방지)
            const existingCheckOut = await prisma.checkOut.findFirst({
              where: {
                attendanceId: attendance.id,
                timestamp: {
                  gte: new Date(checkOutTime.getTime() - 5 * 60000),
                  lte: new Date(checkOutTime.getTime() + 5 * 60000),
                },
              },
            });

            if (!existingCheckOut) {
              return prisma.checkOut.create({
                data: {
                  attendanceId: attendance.id,
                  timestamp: checkOutTime,
                },
              });
            }
            return null;
          })
        );

        return {
          userId: attendance.userId,
          nickname: attendance.nickname,
          processed: {
            checkIns: processedCheckIns.filter(Boolean).length,
            checkOuts: processedCheckOuts.filter(Boolean).length,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      error: null,
      data: results,
    });
  } catch (error) {
    console.error("출퇴근 기록 등록 에러:", error);
    return NextResponse.json(
      {
        success: false,
        error: "출퇴근 기록 등록에 실패했습니다",
        data: null,
      },
      { status: 500 }
    );
  }
}
