import { Groups, Prisma, User } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { UserMemo } from "./realtime";

export type Chunobot = {
  user_id: number;
  reason: string;
  adminName: string | null;
  time: Date;
};

type SignUpUser = Omit<Prisma.UserCreateInput, "hashedPassword">;
export interface RealtimeGameUserData {
  skinId? : string;
  user_id: number;
  last_nickname: string;
  first_join: string;
  wallet?: string;
  bank?: string;
  credit?: string;
  credit2?: string;
  current_coin?: string;
  job: string;
  phone: string;
  registration: string;
  groups: { group_name: string; group_boolean: boolean }[];
  whitelist: boolean;
  weapons: Record<string, { name: string; ammo: number }>;
  inventory: Record<string, { name: string; amount: number }>;
  vehicles: Record<string, string>;
  banned: boolean;
  banadmin?: string;
  banreason?: string;
  bantime?: string;
  jailtime?: number;
  isJailAdmin?: boolean;
  online: boolean;
  skinName?: string;
  last_datetime?: string;
  last_ip?: string;
  newbieCode?: string | null;
  warningCount?: number;
  incidentReports?: any[]; // 상세 타입 필요 시 IncidentReport[] 등으로 변경
  lbPhoneNumber?: string | null;
  lbPhonePin?: string | null;
  discordId: string | null; // DB에서 가져온 ID (접두어 포함)
  discordData?: DiscordUserData | null; // Discord API 조회 결과
  memos?: UserMemo[];
  chunobot?: Chunobot | null;
  emoji?: string | null;
  current_cash?: string;
  cumulative_cash?: string;
  tier_reward?: string;
  message?: string; // API 에러 메시지 등
  error?: boolean; // API 에러 여부
  isIdBan?: boolean;
}

export interface DiscordUserData {
  username: string;
  globalName?: string | null;
  nickname?: string | null;
  joinedAt: string;
  avatarUrl?: string | null;
  roles: string[];
}

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
  UpdateUserData,
  AdminUser,
  RealtimeGroupData,
  RealtimeAdminData,
  UpdateProfileData,
  AdminDto,
  GroupTableData,
};
