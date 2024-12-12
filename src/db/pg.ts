import postgres from "postgres";

const sql = postgres(process.env.SHIBA_LOG_DATABASE_URL || "", {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  types: {
    jsonb: {
      to: 1114,
      from: [3802],
      serialize: JSON.stringify,
      parse: JSON.parse,
    },
  },
});

// 파티션 테이블 생성
const createPartitionTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS game_logs (
      id BIGSERIAL,
      timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      level VARCHAR(10) NOT NULL,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      resource VARCHAR(50),
      metadata JSONB,
      PRIMARY KEY (timestamp, id)
    ) PARTITION BY RANGE (timestamp)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_game_logs_timestamp ON game_logs(timestamp)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_game_logs_type ON game_logs(type)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_game_logs_level ON game_logs(level)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_game_logs_resource ON game_logs(resource)
  `;
};

// 월별 파티션 생성
const createMonthlyPartition = async (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const partitionName = `game_logs_${year}_${month
    .toString()
    .padStart(2, "0")}`;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(partitionName)}
    PARTITION OF game_logs
    FOR VALUES FROM (${startDate}) TO (${endDate})
  `;
};

// 배치 삽입 함수
const batchInsert = async (
  logs: Array<{
    level?: string;
    type: string;
    message: string;
    resource?: string | null;
    metadata?: any;
  }>
) => {
  return sql`
    INSERT INTO game_logs ${sql(
      logs,
      "level",
      "type",
      "message",
      "resource",
      "metadata"
    )}
  `;
};

// 로그 조회 함수
const queryLogs = async (filters: {
  type?: string;
  level?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) => {
  let baseQuery = sql`
    WITH filtered_logs AS (
      SELECT * FROM game_logs WHERE 1=1
  `;

  if (filters.type) baseQuery = sql`${baseQuery} AND type = ${filters.type}`;
  if (filters.level) baseQuery = sql`${baseQuery} AND level = ${filters.level}`;
  if (filters.resource)
    baseQuery = sql`${baseQuery} AND resource = ${filters.resource}`;
  if (filters.startDate)
    baseQuery = sql`${baseQuery} AND timestamp >= ${filters.startDate}`;
  if (filters.endDate)
    baseQuery = sql`${baseQuery} AND timestamp <= ${filters.endDate}`;

  return sql`
    ${baseQuery}
    )
    SELECT 
      (SELECT COUNT(*) FROM filtered_logs) as total_count,
      fl.*
    FROM filtered_logs fl
    ORDER BY timestamp DESC
    LIMIT ${filters.limit || 50}
    OFFSET ${filters.offset || 0}
  `;
};

// 데이터 정리 함수
const cleanupOldData = async (monthsToKeep: number = 6) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsToKeep);

  const partitions = await sql<{ tablename: string }[]>`
    SELECT tablename 
    FROM pg_tables 
    WHERE tablename LIKE 'game_logs_%'
  `;

  for (const { tablename } of partitions) {
    const match = tablename.match(/game_logs_(\d{4})_(\d{2})/);
    if (match) {
      const [_, year, month] = match;
      const partitionDate = new Date(parseInt(year), parseInt(month) - 1);
      if (partitionDate < date) {
        await sql`DROP TABLE IF EXISTS ${sql(tablename)}`;
      }
    }
  }
};

export default {
  sql,
  createPartitionTable,
  createMonthlyPartition,
  batchInsert,
  queryLogs,
  cleanupOldData,
};
