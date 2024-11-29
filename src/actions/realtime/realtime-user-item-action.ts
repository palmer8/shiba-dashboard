"use server";

import {
  RemoveUserVehicleDto,
  RemoveUserWeaponDto,
  UpdateUserDataDto,
} from "@/dto/realtime.dto";
import { realtimeUpdateService } from "@/service/realtime-update-service";
import { GlobalReturn } from "@/types/global-return";
import { UpdateUserData } from "@/types/user";
import { revalidatePath } from "next/cache";

export async function updateUserItemAction(
  data: UpdateUserData
): Promise<GlobalReturn<UpdateUserDataDto>> {
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
