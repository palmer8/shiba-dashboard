"use server";

import { realtimeService } from "@/service/realtime-service";
import { UserMemo } from "@/types/realtime";
import { revalidatePath } from "next/cache";

export async function returnPlayerSkinAction(userId: number) {
  const result = await realtimeService.returnPlayerSkin(userId);
  if (result.success) revalidatePath("/realtime/user");
  return result;
}

export async function updateCompanyCapitalAction(
  companyId: number,
  capital: number
) {
  const result = await realtimeService.updateCompanyCapital(companyId, capital);
  if (result.success) revalidatePath("/log/game");
  return result;
}

export async function playerBanAction(
  userId: number,
  reason: string,
  duration: number,
  type: "ban" | "unban"
) {
  const result = await realtimeService.playerBan(
    userId,
    reason,
    duration.toString(),
    type
  );
  if (result.success) revalidatePath("/realtime/user", "layout");
  return result;
}

export async function deleteMemoAction(memo: UserMemo) {
  const result = await realtimeService.deleteMemo(memo);
  if (result.success) revalidatePath("/realtime/user");
  return result;
}

export async function createMemoAction(
  userId: number,
  adminName: string,
  text: string
) {
  const result = await realtimeService.createMemo(userId, adminName, text);
  if (result.success) revalidatePath("/realtime/user");
  return result;
}

export async function updateMemoAction(originData: UserMemo, text: string) {
  const result = await realtimeService.updateMemo(originData, text);
  if (result.success) revalidatePath("/realtime/user");
  return result;
}
