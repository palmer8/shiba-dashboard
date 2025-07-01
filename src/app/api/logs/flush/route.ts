import { NextResponse } from "next/server";
import { headers } from "next/headers";

// 환경변수 상수 초기화
const PARTITION_LOG_URL = process.env.PARTITION_LOG_URL || "";
const SHIBA_LOG_API_KEY = process.env.SHIBA_LOG_API_KEY || "";

// 환경변수 로드 상태 확인 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  console.log('API /logs/flush 환경변수 초기화:', {
    hasApiKey: !!SHIBA_LOG_API_KEY,
    hasPartitionUrl: !!PARTITION_LOG_URL,
    apiKeyLength: SHIBA_LOG_API_KEY.length,
    partitionUrl: PARTITION_LOG_URL ? PARTITION_LOG_URL.substring(0, 20) + '...' : 'NOT_SET'
  });
}

// API 키 검증
const validateApiKey = async () => {
  const headersList = await headers();
  const apiKey = headersList.get("x-api-key");
  return apiKey === SHIBA_LOG_API_KEY;
};

// 새로운 파티션 로그 서버 플러시 함수
async function flushPartitionServer() {
  try {
    const response = await fetch(`${PARTITION_LOG_URL}/api/logs/flush`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHIBA_LOG_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`파티션 서버 플러시 응답 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('파티션 로그 서버 플러시 실패:', error);
    return null;
  }
}

export async function POST(req: Request) {
  if (!(await validateApiKey())) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  try {
    // 파티션 서버 플러시 실행
    const partitionResult = await flushPartitionServer();

    const response: any = {
      success: true,
      message: "플러시가 완료되었습니다",
      timestamp: new Date().toISOString(),
      partition: {
        success: partitionResult !== null,
        result: partitionResult
      }
    };

    // 개발 환경에서는 상세 정보 포함
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        partitionResult
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("플러시 실패:", error);
    return NextResponse.json(
      { 
        error: "플러시에 실패했습니다", 
        details: error instanceof Error ? error.message : "알 수 없는 오류" 
      },
      { status: 500 }
    );
  }
} 