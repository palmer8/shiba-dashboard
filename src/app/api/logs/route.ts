import { NextResponse } from "next/server";
import db from "@/db/pg";
import { headers } from "next/headers";

// 환경변수 상수 초기화
const PARTITION_LOG_URL = process.env.PARTITION_LOG_URL || "";
const SHIBA_LOG_API_KEY = process.env.SHIBA_LOG_API_KEY || "";

// 환경변수 로드 상태 확인 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  console.log('API /logs 환경변수 초기화:', {
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

// 메모리 저장소
class LogMemoryStore {
  private static instance: LogMemoryStore;
  private buffer: any[] = [];
  private isProcessing: boolean = false;
  private readonly BATCH_SIZE = parseInt(process.env.LOG_BATCH_SIZE ?? "1000");
  private readonly FLUSH_INTERVAL = parseInt(process.env.LOG_FLUSH_INTERVAL_MS ?? "60000");

  private constructor() {
    // 주기적으로 버퍼 플러시
    setInterval(() => this.processBuffer(), this.FLUSH_INTERVAL);
  }

  public static getInstance(): LogMemoryStore {
    if (!LogMemoryStore.instance) {
      LogMemoryStore.instance = new LogMemoryStore();
    }
    return LogMemoryStore.instance;
  }

  public async addLog(log: any) {
    this.buffer.push({
      ...log,
      timestamp: new Date(),
    });

    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.processBuffer();
    }
  }

  private async processBuffer() {
    if (this.isProcessing || this.buffer.length === 0) return;

    this.isProcessing = true;
    const logsToProcess = this.buffer.splice(0, this.BATCH_SIZE);

    try {
      // 10초 이내에 완료되지 않으면 타임아웃 처리
      await Promise.race([
        db.batchInsert(logsToProcess),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("DB insert timeout")), 10_000)
        ),
      ]);
    } catch (error) {
      console.error("DB 저장 실패 – 재시도 대기:", error);
      // 실패한 로그를 다시 버퍼 맨 앞으로 돌려놓아 다음 주기에 재시도
      this.buffer.unshift(...logsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  public getStoredLogs(filters: any = {}) {
    let filteredLogs = [...this.buffer];

    if (filters.type) {
      filteredLogs = filteredLogs.filter((log) => log.type === filters.type);
    }
    if (filters.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === filters.level);
    }
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) <= new Date(filters.endDate)
      );
    }

    // 페이지네이션 처리
    const offset = ((filters.page || 1) - 1) * (filters.limit || 50);
    const paginatedLogs = filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + (filters.limit || 50));

    return {
      records: paginatedLogs,
      total: filteredLogs.length,
      page: filters.page || 1,
      totalPages: Math.ceil(filteredLogs.length / (filters.limit || 50)),
    };
  }
}

const logStore = LogMemoryStore.getInstance();

// 새로운 파티션 로그 서버에 단일 로그 저장하는 함수
async function saveToPartitionServer(logData: any) {
  try {
    const response = await fetch(`${PARTITION_LOG_URL}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHIBA_LOG_API_KEY,
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      throw new Error(`파티션 서버 응답 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('파티션 로그 서버 저장 실패:', error);
    // 파티션 서버 저장 실패는 전체 로직을 중단시키지 않음
    return null;
  }
}

// 새로운 파티션 로그 서버에 배치 로그 저장하는 함수
async function saveBatchToPartitionServer(logs: any[]) {
  try {
    const response = await fetch(`${PARTITION_LOG_URL}/api/logs/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHIBA_LOG_API_KEY,
      },
      body: JSON.stringify({ logs }),
    });

    if (!response.ok) {
      throw new Error(`파티션 서버 배치 응답 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('파티션 로그 서버 배치 저장 실패:', error);
    // 파티션 서버 저장 실패는 전체 로직을 중단시키지 않음
    return null;
  }
}

export async function POST(req: Request) {
  if (!(await validateApiKey())) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  try {
    const requestData = await req.json();

    // 배치 로그인지 단일 로그인지 확인
    const isBatch = Array.isArray(requestData.logs);
    
    if (isBatch) {
      // 배치 로그 처리
      const logs = requestData.logs;
      
      if (!logs || logs.length === 0) {
        return NextResponse.json(
          { error: "로그 배열이 비어있습니다" },
          { status: 400 }
        );
      }

      if (logs.length > 1000) {
        return NextResponse.json(
          { error: "한 번에 최대 1000개의 로그만 처리할 수 있습니다" },
          { status: 400 }
        );
      }

      // 각 로그 유효성 검사
      const invalidLogs = logs.filter((log: any, index: number) => {
        if (!log.type || !log.message) {
          console.error(`로그 ${index}: type과 message 필수`);
          return true;
        }
        return false;
      });

      if (invalidLogs.length > 0) {
        return NextResponse.json(
          { error: `${invalidLogs.length}개의 유효하지 않은 로그가 있습니다` },
          { status: 400 }
        );
      }

      // 배치 처리: 레거시 저장과 파티션 서버 저장을 병렬 처리
      const legacyPromises = logs.map((log: any) => logStore.addLog(log));
      const [legacyResults, partitionResult] = await Promise.allSettled([
        Promise.allSettled(legacyPromises),
        saveBatchToPartitionServer(logs)
      ]);

      // 레거시 저장 결과 확인
      const legacyFailures = legacyResults.status === 'fulfilled' 
        ? (legacyResults.value as PromiseSettledResult<any>[]).filter(result => result.status === 'rejected').length
        : logs.length;

      const response: any = {
        success: true,
        batch: true,
        processed: logs.length,
        legacy: {
          success: logs.length - legacyFailures,
          failures: legacyFailures
        },
        partition: partitionResult.status === 'fulfilled' && partitionResult.value !== null
      };

      // 개발 환경에서는 상세 정보 포함
      if (process.env.NODE_ENV === 'development') {
        response.debug = {
          legacyResults: legacyResults,
          partitionResult: partitionResult.status === 'fulfilled' ? partitionResult.value : partitionResult.reason
        };
      }

      return NextResponse.json(response);

    } else {
      // 단일 로그 처리 (기존 로직)
      const logData = requestData;

      if (!logData.type || !logData.message) {
        return NextResponse.json(
          { error: "필수 필드가 누락되었습니다" },
          { status: 400 }
        );
      }

      // 기존 레거시 로그 저장과 새로운 파티션 로그 서버 저장을 병렬 처리
      const [legacyResult, partitionResult] = await Promise.allSettled([
        logStore.addLog(logData),
        saveToPartitionServer(logData)
      ]);

    // 레거시 저장 실패 시 에러 반환
    if (legacyResult.status === 'rejected') {
      throw legacyResult.reason;
    }

    // 응답에 파티션 서버 저장 결과도 포함
    const response: any = { 
      success: true,
      legacy: true,
      partition: partitionResult.status === 'fulfilled' && partitionResult.value !== null
    };

    // 개발 환경에서는 상세 정보 포함
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        legacyStatus: legacyResult.status,
        partitionStatus: partitionResult.status,
        partitionResult: partitionResult.status === 'fulfilled' ? partitionResult.value : partitionResult.reason
      };
    }

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("로그 저장 실패:", error);
    return NextResponse.json(
      { error: "로그 저장에 실패했습니다", details: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  if (!(await validateApiKey())) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = {
    type: searchParams.get("type") || undefined,
    level: searchParams.get("level") || undefined,
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "50"),
  };

  try {
    // 메모리에서 로그 조회
    const memoryResult = logStore.getStoredLogs(filters);

    return NextResponse.json({
      data: memoryResult.records,
      pagination: {
        total: memoryResult.total,
        totalPages: memoryResult.totalPages,
        currentPage: memoryResult.page,
        limit: filters.limit,
      },
    });
  } catch (error) {
    console.error("로그 조회 실패:", error);
    return NextResponse.json(
      { error: "로그 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
