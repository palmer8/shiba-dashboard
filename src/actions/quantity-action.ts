"use server";

import { itemQuantityService } from "@/service/quantity-service";
import { revalidatePath } from "next/cache";
import { CreateItemQuantityData } from "@/types/quantity";
import { ApiResponse } from "@/types/global.dto";
import { ItemQuantity } from "@prisma/client";

export async function createItemQuantityAction(
  data: CreateItemQuantityData
): Promise<ApiResponse<ItemQuantity>> {
  const result = await itemQuantityService.createItemQuantity(data);

  if (result.success) {
    revalidatePath("/game/item");
  }

  return result;
}

export async function approveItemQuantitiesAction(
  ids: string[]
): Promise<ApiResponse<boolean>> {
  const result = await itemQuantityService.approveItemQuantities(ids);

  if (result.success) {
    revalidatePath("/game/item");
  }

  return result;
}

export async function rejectItemQuantitiesAction(
  ids: string[]
): Promise<ApiResponse<boolean>> {
  const result = await itemQuantityService.rejectItemQuantities(ids);

  if (result.success) {
    revalidatePath("/game/item");
  }

  return result;
}

export async function cancelItemQuantityAction(
  ids: string[]
): Promise<ApiResponse<boolean>> {
  const result = await itemQuantityService.cancelItemQuantity(ids);

  if (result.success) {
    revalidatePath("/game/item");
  }

  return result;
}

export async function deleteItemQuantityAction(
  id: string
): Promise<ApiResponse<boolean>> {
  const result = await itemQuantityService.deleteItemQuantity(id);

  if (result.success) {
    revalidatePath("/game/item");
  }

  return result;
}

export async function rejectAllItemQuantitiesAction(): Promise<
  ApiResponse<boolean>
> {
  const result = await itemQuantityService.rejectAllItemQuantities();

  if (result.success) {
    revalidatePath("/game/item");
  }

  return result;
}

export async function approveAllItemQuantitiesAction(): Promise<
  ApiResponse<boolean>
> {
  const result = await itemQuantityService.approveAllItemQuantities();

  if (result.success) {
    revalidatePath("/game/item");
  }

  return result;
}

export async function getItemQuantitiesByIdsOrigin(
  ids: string[]
): Promise<ApiResponse<ItemQuantity[]>> {
  return await itemQuantityService.getItemQuantitiesByIdsOrigin(ids);
}
