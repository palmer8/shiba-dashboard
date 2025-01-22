import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import {
  AttendanceResponse,
  ProcessedAdminAttendance,
  WorkHoursData,
} from "@/types/attendance";
import { addDays, startOfWeek, endOfWeek, format } from "date-fns";

// 주간 통계 계산 함수 추가
function calculateWeeklyStats(checkIns: any[], checkOuts: any[]) {
  const weeklyStats = [];
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());

  for (let i = 0; i < checkIns.length; i++) {
    const checkIn = checkIns[i];
    const checkOut = checkOuts[i];

    if (!checkIn || !checkOut) continue;

    const checkInDate = new Date(checkIn.timestamp);
    if (checkInDate >= weekStart && checkInDate <= weekEnd) {
      const hours =
        (checkOut.timestamp.getTime() - checkIn.timestamp.getTime()) /
        (1000 * 60 * 60);

      if (hours >= 0 && hours <= 24) {
        weeklyStats.push({
          date: format(checkInDate, "MM/dd"),
          hours: Number(hours.toFixed(1)),
          expected: 8,
        });
      }
    }
  }

  return weeklyStats;
}

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

    const formattedData: ProcessedAdminAttendance[] = attendances.map(
      (attendance) => {
        // 근무 기록을 WorkHoursData 형식으로 변환
        const workHours: WorkHoursData = {};
        attendance.checkIns.forEach((checkIn, index) => {
          const date = format(checkIn.timestamp, "yyyy-MM-dd");
          if (!workHours[date]) workHours[date] = [];

          workHours[date].push({
            startTime: format(checkIn.timestamp, "HH:mm"),
            endTime: attendance.checkOuts[index]
              ? format(attendance.checkOuts[index].timestamp, "HH:mm")
              : null,
          });
        });

        // 주간 통계 계산
        const weeklyStats = calculateWeeklyStats(
          attendance.checkIns,
          attendance.checkOuts
        );

        // 유효한 records만 필터링 (null 값 제외)
        const validRecords = attendance.checkIns.map((checkIn, index) => {
          const date = format(checkIn.timestamp, "yyyy-MM-dd");
          return {
            date,
            in: checkIn.timestamp.toISOString(), // null이 아닌 값만 사용
            out: attendance.checkOuts[index]?.timestamp.toISOString() || null,
            displayIn: format(checkIn.timestamp, "HH:mm"),
            displayOut: attendance.checkOuts[index]
              ? format(attendance.checkOuts[index].timestamp, "HH:mm")
              : null,
            isOvernight: attendance.checkOuts[index]
              ? checkIn.timestamp.getHours() >
                attendance.checkOuts[index].timestamp.getHours()
              : false,
            workHours: attendance.checkOuts[index]
              ? calculateWorkHours(
                  checkIn.timestamp,
                  attendance.checkOuts[index].timestamp
                )
              : "-",
          };
        });

        return {
          userId: attendance.userId,
          nickname: attendance.nickname,
          records: validRecords,
          today: {
            in: attendance.checkIns[0]?.timestamp.toISOString() || null,
            out: attendance.checkOuts[0]?.timestamp.toISOString() || null,
          },
          stats: {
            averageTimes: {
              in: format(new Date(), "HH:mm"),
              out: format(new Date(), "HH:mm"),
            },
            weeklyStats: weeklyStats,
          },
          workHours: Object.fromEntries(
            Object.entries(workHours).filter(([_, value]) => value.length > 0)
          ),
        };
      }
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

// 근무 시간 계산 헬퍼 함수
function calculateWorkHours(inTime: Date, outTime: Date): string {
  let hours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);

  if (hours < 0) {
    hours += 24;
  }

  if (hours > 24) {
    return "-";
  }

  return `${hours.toFixed(1)}시간`;
}

// 일괄 등록 시에도 시간 제한 체크 제거
export async function POST(req: Request) {
  try {
    const records = await req.json();

    if (!Array.isArray(records) || records.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "잘못된 요청 형식이거나 너무 많은 기록입니다",
          data: null,
        },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      records.map(async (record) => {
        const attendance = await prisma.attendance.upsert({
          where: { userId: record.userId },
          create: { userId: record.userId, nickname: record.nickname },
          update: { nickname: record.nickname },
        });

        // 체크인 처리
        const processedCheckIns = await Promise.all(
          (record.checkIns || []).map(async (timestamp: string) => {
            return prisma.checkIn.create({
              data: {
                attendanceId: attendance.id,
                timestamp: new Date(timestamp),
              },
            });
          })
        );

        // 체크아웃 처리
        const processedCheckOuts = await Promise.all(
          (record.checkOuts || []).map(async (timestamp: string) => {
            return prisma.checkOut.create({
              data: {
                attendanceId: attendance.id,
                timestamp: new Date(timestamp),
              },
            });
          })
        );

        return {
          userId: attendance.userId,
          nickname: attendance.nickname,
          processed: {
            checkIns: processedCheckIns.length,
            checkOuts: processedCheckOuts.length,
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
