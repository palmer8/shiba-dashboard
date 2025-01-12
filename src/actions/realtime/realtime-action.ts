"use server";

import { realtimeService } from "@/service/realtime-service";
import { UserMemo } from "@/types/realtime";

export async function returnPlayerSkinAction(userId: number) {
  const result = await realtimeService.returnPlayerSkin(userId);
  return result;
}

export async function updateCompanyCapitalAction(
  companyId: number,
  capital: number
) {
  const result = await realtimeService.updateCompanyCapital(companyId, capital);
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
  return result;
}

export async function deleteMemoAction(memo: UserMemo) {
  const result = await realtimeService.deleteMemo(memo);
  return result;
}

export async function createMemoAction(
  userId: number,
  adminName: string,
  text: string
) {
  const result = await realtimeService.createMemo(userId, adminName, text);
  return result;
}

export async function updateMemoAction(originData: UserMemo, text: string) {
  const result = await realtimeService.updateMemo(originData, text);
  return result;
}

export async function getUserDataAction(userId: number) {
  const result = await realtimeService.getGameUserDataByUserId(userId);
  return result;
}
