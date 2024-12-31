import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(req: Request) {
  try {
    const { userId, nickname } = await req.json();

    // 필수 필드 검사
    if (!userId || !nickname) {
      return NextResponse.json(
        {
          success: false,
          error: "필수 정보가 누락되었습니다",
          data: null,
        },
        { status: 400 }
      );
    }

    // 1. Attendance 레코드 생성 또는 업데이트
    const attendance = await prisma.attendance.upsert({
      where: { userId },
      create: { userId, nickname },
      update: { nickname },
    });

    const now = new Date();

    // 2. 최근 체크아웃 기록 확인 (1시간 이내 중복 방지)
    const recentCheckOut = await prisma.checkOut.findFirst({
      where: {
        attendanceId: attendance.id,
        timestamp: {
          gte: new Date(now.getTime() - 60 * 60000), // 1시간 전
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // 중복 체크아웃 방지
    if (recentCheckOut) {
      return NextResponse.json(
        {
          success: false,
          error: "이미 최근에 퇴근 기록이 있습니다",
          data: {
            lastCheckOut: recentCheckOut.timestamp,
          },
        },
        { status: 400 }
      );
    }

    // 3. 새로운 체크아웃 생성
    const checkOut = await prisma.checkOut.create({
      data: {
        attendanceId: attendance.id,
        timestamp: now,
      },
    });

    return NextResponse.json({
      success: true,
      error: null,
      data: {
        userId,
        nickname,
        checkOut: checkOut.timestamp,
      },
    });
  } catch (error) {
    console.error("퇴근 기록 등록 에러:", error);
    return NextResponse.json(
      {
        success: false,
        error: "퇴근 기록 등록에 실패했습니다",
        data: null,
      },
      { status: 500 }
    );
  }
}
