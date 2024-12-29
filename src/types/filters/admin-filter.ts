import { UserRole } from "@prisma/client";

type AdminFilter = {
  page?: number;
  nickname?: string;
  userId?: number;
  role?: UserRole;
};

type GroupFilter = {
  name?: string;
  role?: UserRole;
};

type AdminGroupFilter = {
  page?: number;
  filter: GroupFilter;
};

export type { AdminFilter, AdminGroupFilter, GroupFilter };
