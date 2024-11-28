import { PrismaClient } from "@generated/mysql";

const mysqlClientSingleton = () => {
  return new PrismaClient();
};
declare const globalThis: {
  mysqlClient: ReturnType<typeof mysqlClientSingleton>;
} & typeof global;

const mysqlClient = globalThis.mysqlClient ?? mysqlClientSingleton();

export default mysqlClient;

if (process.env.NODE_ENV !== "production") globalThis.mysqlClient = mysqlClient;
