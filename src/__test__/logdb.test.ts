import { describe, expect, test, beforeAll, afterAll } from "vitest";
import db from "@/db/pg";
import { logService } from "@/service/log-service";

const LOG_TYPES = [
  "ITEM_ACQUIRE",
  "ITEM_USE",
  "BATTLE_START",
  "BATTLE_END",
  "TRADE",
  "LOGIN",
  "LOGOUT",
  "QUEST_COMPLETE",
] as const;

const LOG_LEVELS = ["info", "warn", "error", "debug"] as const;

const RESOURCES = ["GOLD", "GEM", "ENERGY", "ITEM", "CHARACTER", null] as const;

type LogType = (typeof LOG_TYPES)[number];

// 랜덤 메시지 생성 함수
const generateRandomMessage = (type: LogType): string => {
  switch (type) {
    case "ITEM_ACQUIRE":
      return `아이템 획득${
        Math.random() > 0.5 ? ` (수량: ${Math.floor(Math.random() * 100)})` : ""
      }`;
    case "ITEM_USE":
      return `아이템 사용${
        Math.random() > 0.5 ? ` (수량: ${Math.floor(Math.random() * 10)})` : ""
      }`;
    case "BATTLE_START":
      return `전투 시작 (참가자 수: ${Math.floor(Math.random() * 5) + 1}명)`;
    case "BATTLE_END":
      return `전투 종료 (승자: 플레이어${Math.floor(Math.random() * 100)})`;
    case "TRADE":
      return Math.random() > 0.5
        ? `플레이어 간 거래 완료`
        : `거래 완료 (거래액: ${Math.floor(Math.random() * 10000)} Gold)`;
    case "LOGIN":
      return "게임 접속";
    case "LOGOUT":
      return "게임 종료";
    case "QUEST_COMPLETE":
      return "퀘스트 완료";
    default:
      return `${type} 이벤트 발생`;
  }
};

// 랜덤 메타데이터 생성 함수
const generateRandomMetadata = (type: LogType) => {
  const baseMetadata: Record<string, any> = {
    timestamp: new Date().toISOString(),
    serverId: `서버_${Math.floor(Math.random() * 10) + 1}`,
  };

  if (Math.random() > 0.3) {
    switch (type) {
      case "ITEM_ACQUIRE":
      case "ITEM_USE":
        if (Math.random() > 0.5) {
          baseMetadata.itemId = `아이템_${Math.floor(Math.random() * 1000)}`;
          baseMetadata.amount = Math.floor(Math.random() * 100);
        }
        break;
      case "TRADE":
        if (Math.random() > 0.5) {
          baseMetadata.from = `플레이어_${Math.floor(Math.random() * 1000)}`;
          baseMetadata.to = `플레이어_${Math.floor(Math.random() * 1000)}`;
          baseMetadata.amount = Math.floor(Math.random() * 10000);
        }
        break;
    }
    return baseMetadata;
  }
  return null;
};

describe("게임 로그 데이터베이스 테스트", () => {
  beforeAll(async () => {
    try {
      // 테스트 데이터베이스 연결 확인
      const testResult = await db.sql`SELECT 1 as result`;
      if (testResult[0].result !== 1) {
        throw new Error("데이터베이스 연결 테스트 실패");
      }
      console.log("데이터베이스 연결 성공");

      // 파티션 테이블 생성
      await db.createPartitionTable();
      await db.createMonthlyPartition(new Date());
    } catch (error) {
      console.error("데이터베이스 설정 실패:", error);
      throw error;
    }
  });

  afterAll(async () => {
    await db.sql.end();
  });

  test("5000개의 랜덤 게임 로그 삽입 및 조회", async () => {
    const logs = Array.from({ length: 5000 }, () => {
      const type = LOG_TYPES[Math.floor(Math.random() * LOG_TYPES.length)];
      return {
        level: LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)],
        type,
        message: generateRandomMessage(type),
        resource: RESOURCES[Math.floor(Math.random() * RESOURCES.length)],
        metadata: generateRandomMetadata(type),
      };
    });

    // 배치 단위로 로그 삽입
    const BATCH_SIZE = 100;
    for (let i = 0; i < logs.length; i += BATCH_SIZE) {
      const batch = logs.slice(i, i + BATCH_SIZE);
      await db.batchInsert(batch);
    }

    // 기본 조회 테스트
    const basicQuery = await logService.getGameLogs({ page: 1, limit: 10 });
    expect(basicQuery.success).toBe(true);
    expect(basicQuery.data?.total).toBeGreaterThanOrEqual(5000);
    expect(basicQuery.data?.records.length).toBe(10);

    // 타입 필터링 테스트
    const typeQuery = await logService.getGameLogs({
      type: "ITEM_ACQUIRE",
      page: 1,
      limit: 10,
    });
    expect(typeQuery.success).toBe(true);
    expect(
      typeQuery.data?.records.every((log) => log.type === "ITEM_ACQUIRE")
    ).toBe(true);

    // 레벨 필터링 테스트
    const levelQuery = await logService.getGameLogs({
      level: "error",
      page: 1,
      limit: 10,
    });
    expect(levelQuery.success).toBe(true);
    expect(levelQuery.data?.records.every((log) => log.level === "error")).toBe(
      true
    );

    // 리소스 필터링 테스트
    const resourceQuery = await logService.getGameLogs({
      resource: "GOLD",
      page: 1,
      limit: 10,
    });
    expect(resourceQuery.success).toBe(true);
    expect(
      resourceQuery.data?.records.every((log) => log.resource === "GOLD")
    ).toBe(true);
  });
});
