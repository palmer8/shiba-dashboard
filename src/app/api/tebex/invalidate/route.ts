import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 권한 검증 - SUPERMASTER만 접근 가능
    const session = await auth();
    if (!session?.user || !hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return NextResponse.json(
        { success: false, error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    // 환경 변수 확인
    const userboardApiUrl = process.env.USERBOARD_API_URL;
    const userboardApiKey = process.env.USERBOARD_API_KEY;

    if (!userboardApiUrl || !userboardApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "유저보드 API 설정이 없습니다." 
        },
        { status: 500 }
      );
    }

    // Tebex 캐시 무효화 API 호출
    const response = await fetch(
      `${userboardApiUrl}/api/tebex/invalidate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": userboardApiKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Tebex Invalidate] API 호출 실패:", errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: `Tebex 캐시 무효화 실패: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: "Tebex 캐시가 성공적으로 무효화되었습니다.",
      data: result
    });

  } catch (error) {
    console.error("[Tebex Invalidate] 오류:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
}