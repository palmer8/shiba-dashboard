"use server";

import { UpdateUserGroupDto } from "@/dto/realtime.dto";
import { realtimeUpdateService } from "@/service/realtime-update-service";
import { revalidatePath } from "next/cache";

export async function updateUserGroupAction(data: UpdateUserGroupDto) {
  const result = await realtimeUpdateService.updateUserGroup(data);
  revalidatePath("/realtime/user");
  return result;
}

export async function updateUserGroupByGroupMenuAction(
  data: UpdateUserGroupDto
) {
  const result = await realtimeUpdateService.updateUserGroup(data);
  revalidatePath("/realtime/group");
  return result;
}
