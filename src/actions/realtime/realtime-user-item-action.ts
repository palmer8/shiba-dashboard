"use server";

import {
  RemoveUserVehicleDto,
  RemoveUserWeaponDto,
  UpdateUserDataDto,
} from "@/dto/realtime.dto";
import { realtimeService } from "@/service/realtime-service";
import { realtimeUpdateService } from "@/service/realtime-update-service";
import { GlobalReturn } from "@/types/global-return";
import { ApiResponse } from "@/types/global.dto";
import { UpdateUserData } from "@/types/user";
import { revalidatePath } from "next/cache";

export async function updateUserItemAction(
  data: UpdateUserData
): Promise<ApiResponse<UpdateUserDataDto>> {
  const result = await realtimeUpdateService.updateUserInventory(data);
  revalidatePath("/realtime/user");
  return result;
}

export async function removeUserWeaponAction(data: RemoveUserWeaponDto) {
  const result = await realtimeUpdateService.removeUserWeapon(data);
  revalidatePath("/realtime/user");
  return result;
}

export async function removeUserVehicleAction(data: RemoveUserVehicleDto) {
  const result = await realtimeUpdateService.removeUserVehicle(data);
  revalidatePath("/realtime/user");
  return result;
}

export async function getItemsByItemNameAction(itemName: string) {
  const result = await realtimeService.getItemsByItemName(itemName);
  return result;
}
