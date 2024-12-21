"use server";

import { creditService } from "@/service/credit-service";
import { RewardRevokeCreditType, ActionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createCreditAction(data: {
  userId: string;
  creditType: RewardRevokeCreditType;
  type: ActionType;
  amount: string;
  reason: string;
}) {
  const result = await creditService.createRewardRevoke(data);
  if (result.success) revalidatePath("/game/credit");
  return result;
}

export async function approveCreditAction(ids: string[]) {
  const result = await creditService.approveRewardRevokes(ids);
  if (result.success) {
    revalidatePath("/game/credit");
  }
  return result;
}

export async function rejectCreditAction(ids: string[]) {
  const result = await creditService.rejectRewardRevokes(ids);
  if (result.success) revalidatePath("/game/credit");
  return result;
}

export async function cancelCreditAction(ids: string[]) {
  const result = await creditService.cancelRewardRevokes(ids);
  if (result.success) revalidatePath("/game/credit");
  return result;
}

export async function deleteCreditAction(id: string) {
  const result = await creditService.deleteRewardRevoke(id);
  if (result.success) revalidatePath("/game/credit");
  return result;
}

export async function updateCreditAction(
  id: string,
  data: {
    userId: string;
    creditType: RewardRevokeCreditType;
    type: ActionType;
    amount: string;
    reason: string;
  }
) {
  const result = await creditService.updateRewardRevoke(id, data);
  if (result.success) {
    revalidatePath("/game/credit");
  }
  return result;
}

export async function rejectAllCreditAction() {
  const result = await creditService.rejectAllRewardRevokes();
  if (result.success) revalidatePath("/game/credit");
  return result;
}

export async function approveAllCreditAction() {
  const result = await creditService.approveAllRewardRevokes();
  if (result.success) {
    revalidatePath("/game/credit");
    return result;
  }
  return {
    success: false,
    data: null,
    error: "전체 재화 지급/회수 티켓 승인 실패",
  };
}

export async function getRewardRevokeByIdsOrigin(ids: string[]) {
  const result = await creditService.getRewardRevokeByIdsOrigin(ids);
  return result;
}
