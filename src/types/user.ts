import { Prisma, User } from "@prisma/client";

type SignUpUser = Omit<Prisma.UserCreateInput, "hashedPassword">;
type RealtimeGameUserData = {
  banadmin: string | null;
  bank: string | null;
  banned: boolean | null;
  banreason: string | null;
  bantime: string | null;
  chunoreason: string | null;
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
  sanctions: Record<string, never>[] | null;
  tier_reward: string | null;
  vehicles: Record<string, string> | null;
  wallet: string | null;
  weapons: Record<string, string> | null;
};

type UpdateUserData = {
  user_id: string;
  itemcode: string;
  amount: number;
  type: "add" | "remove";
};

type AdminUser = Pick<
  User,
  "id" | "nickname" | "role" | "createdAt" | "name" | "userId" | "isPermissive"
>;

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
  password?: string | null;
};

export type {
  SignUpUser,
  RealtimeGameUserData,
  UpdateUserData,
  AdminUser,
  RealtimeGroupData,
  RealtimeAdminData,
  UpdateProfileData,
};
