import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let receivedUserId = body.userId; // 프론트에서 User 테이블의 숫자 ID (user.userId)를 보내야 함

    if (receivedUserId === undefined || receivedUserId === null) {
      return NextResponse.json(
        {
          success: false,
          error: "사용자 ID(userId)가 누락되었습니다.",
          data: null,
        },
        { status: 400 }
      );
    }

    const numericUserId = Number(receivedUserId);
    if (isNaN(numericUserId)) {
      return NextResponse.json(
        {
          success: false,
          error: "제공된 사용자 ID가 유효한 숫자가 아닙니다.",
          data: null,
        },
        { status: 400 }
      );
    }

    // 사용자 존재 여부 확인 (User 테이블의 숫자 ID 기준)
    const existingUser = await prisma.user.findUnique({
      where: { userId: numericUserId }, // User.userId (Int)로 조회
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: `제공된 사용자 ID(${numericUserId})에 해당하는 사용자가 없습니다.`,
          data: null,
        },
        { status: 404 } // Not Found
      );
    }

    // 사용자가 이미 체크인 상태인지 확인 (가장 최근 기록이 체크아웃되지 않은 경우)
    const lastUnfinishedRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userNumericId: numericUserId, // AttendanceRecord.userNumericId (Int)로 조회
        checkOutTime: null,
      },
      orderBy: {
        checkInTime: "desc",
      },
    });

    if (lastUnfinishedRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "이미 체크인된 상태입니다. 먼저 체크아웃을 진행해주세요.",
          data: lastUnfinishedRecord,
        },
        { status: 409 } // Conflict
      );
    }

    // 새 출근 기록 생성
    const newRecord = await prisma.attendanceRecord.create({
      data: {
        userNumericId: numericUserId, // AttendanceRecord.userNumericId (Int) 사용
        checkInTime: new Date(),
      },
      include: {
        user: {
          select: {
            id: true, // User's UUID
            userId: true, // User's numeric ID
            nickname: true,
            image: true,
            // hashedPassword, email, emailVerified 등 민감 정보 제외
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "체크인되었습니다.",
        data: newRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Check-in API Error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: "서버 오류: " + error.message, data: null },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "알 수 없는 서버 오류.", data: null },
      { status: 500 }
    );
  }
}
