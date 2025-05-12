import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
// import { auth } from "@/lib/auth-config"; // 필요시 세션 기반 사용자 ID 가져오기

export async function POST(req: Request) {
  try {
    // const session = await auth(); // 예시: 세션에서 사용자 ID 가져오기
    // if (!session?.user?.id) { // session.user.id가 User 테이블의 UUID id 라고 가정
    //   return NextResponse.json(
    //     { success: false, error: "인증되지 않은 사용자입니다." },
    //     { status: 401 }
    //   );
    // }
    // const userIdFromSession = session.user.id;

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

    // 가장 최근의 체크인 기록 중 아직 체크아웃되지 않은 기록을 찾습니다.
    const recordToCheckout = await prisma.attendanceRecord.findFirst({
      where: {
        userNumericId: numericUserId, // AttendanceRecord.userNumericId (Int)로 조회
        checkOutTime: null,
      },
      orderBy: {
        checkInTime: "desc",
      },
    });

    if (!recordToCheckout) {
      return NextResponse.json(
        {
          success: false,
          error:
            "체크아웃할 대상(체크인 기록)이 없습니다. 먼저 체크인을 진행해주세요.",
          data: null,
        },
        { status: 404 } // Not Found
      );
    }

    const now = new Date();

    const updatedAttendanceRecord = await prisma.attendanceRecord.update({
      where: {
        id: recordToCheckout.id, // 업데이트는 AttendanceRecord의 id (UUID) 사용
      },
      data: {
        checkOutTime: now,
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
        message: "체크아웃되었습니다.",
        data: updatedAttendanceRecord,
      },
      { status: 200 } // OK
    );
  } catch (error) {
    console.error("Checkout API Error:", error);
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
