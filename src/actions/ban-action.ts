"use server";

import {
  BanFilters,
  AddBanData,
  EditBanData,
  banService,
} from "@/service/ban-service";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth-config";
import { UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";

export async function getBanListAction(filters: BanFilters) {
  return await banService.getBanList(filters);
}

export async function getBanRecordByUserIdAction(userId: string) {
  const session = await auth();
  if (!session?.user || !hasAccess(session.user.role, UserRole.STAFF)) {
    return { success: false, data: null, error: "권한이 없습니다." };
  }
  return await banService.getBanRecordByUserId(userId);
}

export async function banUserViaApiAction(userId: number, reason: string) {
  const session = await auth();
  if (!session?.user || !hasAccess(session.user.role, UserRole.MASTER)) {
    return { success: false, data: null, error: "권한이 없습니다." };
  }
  const result = await banService.banUserViaApi(userId, reason);
  return result;
}

export async function unbanUserViaApiAction(banId: string) {
  const session = await auth();
  if (!session?.user || !hasAccess(session.user.role, UserRole.MASTER)) {
    return { success: false, data: null, error: "권한이 없습니다." };
  }
  const result = await banService.unbanUserViaApi(banId);
  return result;
}

export async function addBanDirectlyToDbAction(data: AddBanData) {
  const session = await auth();
  if (!session?.user || !hasAccess(session.user.role, UserRole.MASTER)) {
    return { success: false, data: null, error: "권한이 없습니다." };
  }
  const result = await banService.addBanDirectlyToDb(data);
  if (result.success) revalidatePath("/game/ban");
  return result;
}

export async function editBanDirectlyInDbAction(data: EditBanData) {
  const session = await auth();
  if (!session?.user || !hasAccess(session.user.role, UserRole.MASTER)) {
    return { success: false, data: null, error: "권한이 없습니다." };
  }
  const result = await banService.editBanDirectlyInDb(data);
  if (result.success) revalidatePath("/game/ban");
  return result;
}

export async function deleteBanDirectlyFromDbAction(id: string) {
  const session = await auth();
  if (!session?.user || !hasAccess(session.user.role, UserRole.MASTER)) {
    return { success: false, data: null, error: "권한이 없습니다." };
  }
  const result = await banService.deleteBanDirectlyFromDb(id);
  if (result.success) revalidatePath("/game/ban");
  return result;
}
