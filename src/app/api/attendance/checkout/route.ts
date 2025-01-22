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

    // 시간 제한 체크 제거하고 바로 체크아웃 생성
    const checkOut = await prisma.checkOut.create({
      data: {
        attendanceId: attendance.id,
        timestamp: new Date(),
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
