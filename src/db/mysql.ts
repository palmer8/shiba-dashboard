import { createPool, Pool } from "mysql2/promise";

let globalPool: Pool | undefined;

function getPool(): Pool {
  if (!globalPool) {
    globalPool = createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectionLimit: 30, // connection pool 30
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true, // 성능 개선을 위한 keepAlive 설정
      keepAliveInitialDelay: 0,
    });
  }
  return globalPool;
}

export default getPool();
