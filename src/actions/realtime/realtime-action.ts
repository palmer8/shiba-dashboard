"use server";

import { realtimeService } from "@/service/realtime-service";
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
    duration,
    type
  );
  if (result.success) revalidatePath("/realtime/user", "layout");
  return result;
}
