import { UserRole } from "@prisma/client";

type AdminFilter = {
  page?: number;
  nickname?: string;
  userId?: number;
  role?: UserRole;
};

export type { AdminFilter };
