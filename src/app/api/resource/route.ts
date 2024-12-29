import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_METRICS_API_URL || "",
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 2 }, // 2초 캐시
      }
    );

    if (!response.ok) {
      throw new Error("외부 서버 응답 오류");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Metrics proxy error:", error);
    return NextResponse.json({
      success: false,
      error: "메트릭 데이터를 가져오는데 실패했습니다.",
    });
  }
}
