import { NextResponse } from "next/server";
import db from "@/db/pg";
import { headers } from "next/headers";

// API 키 검증
const validateApiKey = async () => {
  const headersList = await headers();
  const apiKey = headersList.get("x-api-key");
  return apiKey === process.env.SHIBA_LOG_API_KEY;
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

export async function POST(req: Request) {
  if (!(await validateApiKey())) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  try {
    const logData = await req.json();

    if (!logData.type || !logData.message) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다" },
        { status: 400 }
      );
    }

    await logStore.addLog(logData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("로그 저장 실패:", error);
    return NextResponse.json(
      { error: "로그 저장에 실패했습니다" },
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
