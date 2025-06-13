import { logMemoryStore } from "@/service/log-service";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Cron Job 요청을 위한 API 키 검증
const validateApiKey = async () => {
  const headersList = await headers();
  const apiKey = headersList.get("x-api-key");
  // Cron Job 전용 API 키를 사용하는 것이 보안상 더 좋습니다.
  return apiKey === process.env.SHIBA_CRON_API_KEY;
};

/**
 * Cron Job에 의해 호출되어 메모리 로그 버퍼를 강제로 DB에 저장합니다.
 */
export async function POST() {
  const headersList = await headers();
  const apiKey = headersList.get("x-api-key");

  const isProd = process.env.NODE_ENV === "production";
  const cronKey = process.env.SHIBA_CRON_API_KEY;
  const logKey = process.env.SHIBA_LOG_API_KEY;

  let isAuthorized = false;
  if (isProd) {
    // 프로덕션 환경에서는 Cron Job 전용 키만 허용합니다.
    isAuthorized = apiKey === cronKey;
  } else {
    // 개발 환경에서는 테스트 편의를 위해 Cron Job 키 또는 일반 로그 키를 허용합니다.
    isAuthorized = apiKey === cronKey || apiKey === logKey;
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  try {
    const bufferSizeBefore = logMemoryStore.getBufferSize();

    if (bufferSizeBefore === 0) {
      return NextResponse.json({
        success: true,
        message: "처리할 로그가 없습니다.",
        flushedCount: 0,
      });
    }

    await logMemoryStore.forceFlush();
    const bufferSizeAfter = logMemoryStore.getBufferSize();
    const flushedCount = bufferSizeBefore - bufferSizeAfter;

    console.log(`Cron-triggered log flush: ${flushedCount} logs processed.`);

    return NextResponse.json({
      success: true,
      message: "로그 버퍼를 성공적으로 비웠습니다.",
      flushedCount,
    });
  } catch (error) {
    console.error("Cron-triggered log flush 실패:", error);
    return NextResponse.json(
      { error: "로그 버퍼를 비우는 데 실패했습니다." },
      { status: 500 },
    );
  }
} 