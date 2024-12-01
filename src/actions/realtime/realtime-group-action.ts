"use server";

import { UpdateUserGroupDto } from "@/dto/realtime.dto";
import { realtimeService } from "@/service/realtime-service";
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
  revalidatePath("/realtime/group", "layout");
  return result;
}

export async function getRealtimeUserGroupsAction(userId: number) {
  const result = await realtimeService.getUserGroups(userId);
  return result;
}

export async function getGroupsByGroupIdAction(groupId: string) {
  const result = await realtimeService.getGroupsByGroupId(groupId);
  return result;
}
