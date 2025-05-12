"use server";

import { BanFilters, AddBanData, EditBanData } from "@/service/ban-service";
import { banService } from "@/service/ban-service";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth-config";
import { UserRole } from "@prisma/client";

export async function getBanListAction(filters: BanFilters) {
  return await banService.getBanList(filters);
}

export async function addBanAction(data: AddBanData) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.MASTER &&
      session.user.role !== UserRole.SUPERMASTER)
  ) {
    return { success: false, data: null, error: "권한이 없습니다." };
  }
  const result = await banService.addBan(data);
  if (result.success) revalidatePath("/game/ban");
  return result;
}

export async function editBanAction(data: EditBanData) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.MASTER &&
      session.user.role !== UserRole.SUPERMASTER)
  ) {
    return { success: false, data: null, error: "권한이 없습니다." };
  }
  const result = await banService.editBan(data);
  if (result.success) revalidatePath("/game/ban");
  return result;
}

export async function deleteBanAction(id: string) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.MASTER &&
      session.user.role !== UserRole.SUPERMASTER)
  ) {
    return { success: false, data: null, error: "권한이 없습니다." };
  }
  const result = await banService.deleteBan(id);
  if (result.success) revalidatePath("/game/ban");
  return result;
}
