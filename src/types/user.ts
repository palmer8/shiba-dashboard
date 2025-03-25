import { Groups, Prisma, User } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { IncidentReport } from "./report";
import { UserMemo } from "./realtime";

export type Chunobot = {
  user_id: number;
  reason: string;
  adminName: string | null;
  time: Date;
};

type SignUpUser = Omit<Prisma.UserCreateInput, "hashedPassword">;
type RealtimeGameUserData = {
  banadmin: string | null;
  bank: string | null;
  banned: boolean | null;
  banreason: string | null;
  bantime: string | null;
  chunoreason: string | null;
  chunobot: Chunobot | null;
  credit: string | null;
  credit2: string | null;
  cumulative_cash: number | null;
  current_cash: number | null;
  current_coin: number | null;
  exercise: string | null;
  exp: string | null;
  first_join: string | null;
  groups: Record<string, never> | null;
  inventory: Record<string, never> | null;
  job: string | null;
  last_datetime: string | null;
  last_ip: string | null;
  last_nickname: string | null;
  online: boolean | null;
  phone: string | null;
  registration: string | null;
  newbieCode: string | null;
  warningCount: number | null;
  sanctions: Record<string, never>[] | null;
  tier_reward: string | null;
  vehicles: Record<string, string> | null;
  wallet: string | null;
  weapons: Record<string, string> | null;
  skinName?: string;
  lbPhoneNumber?: string;
  lbPhonePin?: string;
  incidentReports: IncidentReport[];
  memos: UserMemo[] | null;
  error?: number;
  message?: string;
  discordData?: {
    username: string;
    globalName: string;
    nickname: string;
    joinedAt: string;
    avatarUrl: string;
    roles: string[];
  };
  isJailAdmin?: boolean;
  jailtime?: number;
  emoji: string | null;
  weaponAmmo?: Record<string, number>;
};

type UpdateUserData = {
  user_id: string;
  itemcode: string;
  amount: number;
  type: "add" | "remove";
};

type AdminUser = Omit<User, "hashedPassword">;

type RealtimeGroupData = {
  user_id: string;
  name: string;
  job: string;
};

type RealtimeAdminData = {
  users: RealtimeGroupData[];
};

type UpdateProfileData = {
  image?: string | null;
  password?: string;
  currentPassword?: string;
};

type AdminDto = {
  items: AdminUser[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export type SignUpResponse = {
  user: {
    id: string;
    name: string;
    nickname: string;
    role: UserRole;
    isPermissive: boolean;
    userId: number;
  } | null;
  error?: string;
};

interface GroupTableData {
  records: Groups[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export type {
  SignUpUser,
  RealtimeGameUserData,
  UpdateUserData,
  AdminUser,
  RealtimeGroupData,
  RealtimeAdminData,
  UpdateProfileData,
  AdminDto,
  GroupTableData,
};
