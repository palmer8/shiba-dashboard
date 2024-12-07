"use server";

import { itemQuantityService } from "@/service/quantity-service";
import { revalidatePath } from "next/cache";
import { CreateItemQuantityData } from "@/types/quantity";

export async function createItemQuantityAction(data: CreateItemQuantityData) {
  try {
    const result = await itemQuantityService.createItemQuantity(data);
    if (result.success) {
      revalidatePath("/game/item");
    }
    return result;
  } catch (error) {
    console.error("Create item quantity action error:", error);
    return {
      success: false,
      message: "아이템 지급/회수 티켓 생성 실패",
      data: null,
      error,
    };
  }
}

export async function approveItemQuantitiesAction(ids: string[]) {
  try {
    const result = await itemQuantityService.approveItemQuantities(ids);
    if (result.success) {
      revalidatePath("/game/item");
    }
    return result;
  } catch (error) {
    console.error("Approve item quantities action error:", error);
    return {
      success: false,
      message: "아이템 지급/회수 승인 실패",
      data: null,
      error,
    };
  }
}

export async function rejectItemQuantitiesAction(ids: string[]) {
  try {
    const result = await itemQuantityService.rejectItemQuantities(ids);
    if (result.success) {
      revalidatePath("/game/item");
    }
    return result;
  } catch (error) {
    console.error("Reject item quantities action error:", error);
    return {
      success: false,
      message: "아이템 지급/회수 거절 실패",
      data: null,
      error,
    };
  }
}

export async function cancelItemQuantityAction(ids: string[]) {
  try {
    const result = await itemQuantityService.cancelItemQuantity(ids);
    if (result.success) {
      revalidatePath("/game/item");
    }
    return result;
  } catch (error) {
    console.error("Cancel item quantity action error:", error);
    return {
      success: false,
      message: "아이템 지급/회수 취소 실패",
      data: null,
      error,
    };
  }
}

export async function deleteItemQuantityAction(id: string) {
  try {
    const result = await itemQuantityService.deleteItemQuantity(id);
    if (result.success) {
      revalidatePath("/game/item");
    }
    return result;
  } catch (error) {
    console.error("Delete item quantity action error:", error);
    return {
      success: false,
      message: "아이템 지급/회수 삭제 실패",
      data: null,
      error,
    };
  }
}

export async function rejectAllItemQuantitiesAction() {
  try {
    const result = await itemQuantityService.rejectAllItemQuantities();
    if (result.success) {
      revalidatePath("/game/item");
    }
    return result;
  } catch (error) {
    console.error("Delete item quantity action error:", error);
    return {
      success: false,
      message: "아이템 지급/회수 전체 거절 실패",
      data: null,
      error,
    };
  }
}

export async function approveAllItemQuantitiesAction() {
  try {
    const result = await itemQuantityService.approveAllItemQuantities();
    if (result.success) {
      revalidatePath("/game/item");
    }
    return result;
  } catch (error) {
    console.error("Delete item quantity action error:", error);
    return {
      success: false,
      message: "아이템 지급/회수 전체 승인 실패",
      data: null,
      error,
    };
  }
}

export async function getItemQuantitiesByIdsOrigin(ids: string[]) {
  return await itemQuantityService.getItemQuantitiesByIdsOrigin(ids);
}
