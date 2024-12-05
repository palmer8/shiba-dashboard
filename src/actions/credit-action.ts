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
  try {
    const result = await creditService.createRewardRevoke(data);
    if (result.success) {
      revalidatePath("/game/credit");
    }
    return result;
  } catch (error) {
    console.error("Create credit action error:", error);
    return {
      success: false,
      message: "재화 지급/회수 티켓 생성 실패",
      data: null,
      error,
    };
  }
}

export async function approveCreditAction(ids: string[]) {
  try {
    const result = await creditService.approveRewardRevokes(ids);
    if (result.success) {
      revalidatePath("/game/credit");
      return result;
    }
    return {
      success: false,
      message: "재화 지급/회수 티켓 승인 실패",
      data: null,
      error: result.error,
    };
  } catch (error) {
    console.error("Approve credit action error:", error);
    return {
      success: false,
      message: "재화 지급/회수 티켓 승인 중 오류가 발생했습니다",
      data: null,
      error,
    };
  }
}

export async function rejectCreditAction(ids: string[]) {
  try {
    const result = await creditService.rejectRewardRevokes(ids);
    if (result.success) {
      revalidatePath("/game/credit");
      return result;
    }
    return {
      success: false,
      message: "재화 지급/회수 티켓 거절 실패",
      data: null,
      error: result.error,
    };
  } catch (error) {
    console.error("Reject credit action error:", error);
    return {
      success: false,
      message: "재화 지급/회수 티켓 거절 중 오류가 발생했습니다",
      data: null,
      error,
    };
  }
}

export async function cancelCreditAction(ids: string[]) {
  try {
    const result = await creditService.cancelRewardRevokes(ids);
    if (result.success) {
      revalidatePath("/game/credit");
    }
    return result;
  } catch (error) {
    console.error("Cancel credit action error:", error);
    return {
      success: false,
      message: "재화 지급/회수 티켓 취소 실패",
      data: null,
      error,
    };
  }
}

export async function deleteCreditAction(id: string) {
  try {
    const result = await creditService.deleteRewardRevoke(id);
    if (result.success) {
      revalidatePath("/game/credit");
    }
    return result;
  } catch (error) {
    console.error("Delete credit action error:", error);
  }
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
  try {
    const result = await creditService.updateRewardRevoke(id, data);
    if (result.success) {
      revalidatePath("/game/credit");
      return result;
    }
    return {
      success: false,
      message: "재화 지급/회수 티켓 수정 실패",
      data: null,
      error: result.error,
    };
  } catch (error) {
    console.error("Update credit action error:", error);
    return {
      success: false,
      message: "재화 지급/회수 티켓 수정 중 오류가 발생했습니다",
      data: null,
      error,
    };
  }
}

export async function rejectAllCreditAction() {
  try {
    const result = await creditService.rejectAllRewardRevokes();
    if (result.success) {
      revalidatePath("/game/credit");
      return result;
    }
    return {
      success: false,
      message: "전체 재화 지급/회수 티켓 거절 실패",
      data: null,
      error: result.error,
    };
  } catch (error) {
    console.error("Reject all credit action error:", error);
    return {
      success: false,
      message: "전체 재화 지급/회수 티켓 거절 중 오류가 발생했습니다",
      data: null,
      error,
    };
  }
}

export async function approveAllCreditAction() {
  try {
    const result = await creditService.approveAllRewardRevokes();
    if (result.success) {
      revalidatePath("/game/credit");
      return result;
    }
    return {
      success: false,
      message: "전체 재화 지급/회수 티켓 승인 실패",
      data: null,
      error: result.error,
    };
  } catch (error) {
    console.error("Approve all credit action error:", error);
    return {
      success: false,
      message: "전체 재화 지급/회수 티켓 승인 중 오류가 발생했습니다",
      data: null,
      error,
    };
  }
}

export async function getRewardRevokeByIdsOrigin(ids: string[]) {
  const result = await creditService.getRewardRevokeByIdsOrigin(ids);
  return result;
}
