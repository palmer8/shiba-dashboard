import { PrismaClient } from "@prisma/client";

const postgresqlClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  postgresqlClient: ReturnType<typeof postgresqlClientSingleton>;
} & typeof global;

const postgresqlClient =
  globalThis.postgresqlClient ?? postgresqlClientSingleton();

export default postgresqlClient;

if (process.env.NODE_ENV !== "production")
  globalThis.postgresqlClient = postgresqlClient;
