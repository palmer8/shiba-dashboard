"use server";

import { realtimeService } from "@/service/realtime-service";
import { realtimeUpdateService } from "@/service/realtime-update-service";
import { revalidatePath } from "next/cache";
import { UpdateUserGroupDto, RealtimeGroupResponse } from "@/types/realtime";
import { ApiResponse } from "@/types/global.dto";

export async function updateUserGroupAction(
  data: UpdateUserGroupDto
): Promise<ApiResponse<UpdateUserGroupDto>> {
  const result = await realtimeUpdateService.updateUserGroup(data);
  if (result.success) revalidatePath("/realtime/user");
  return result;
}

export async function updateUserGroupByGroupMenuAction(
  data: UpdateUserGroupDto
): Promise<ApiResponse<UpdateUserGroupDto>> {
  const result = await realtimeUpdateService.updateUserGroup(data);
  if (result.success) revalidatePath("/realtime/group", "layout");
  return result;
}

export async function getRealtimeUserGroupsAction(
  userId: number
): Promise<ApiResponse<RealtimeGroupResponse>> {
  return await realtimeService.getUserGroups(userId);
}

export async function getGroupsByGroupIdAction(
  groupId: string
): Promise<ApiResponse<{ groupId: string; groupBoolean: boolean }[]>> {
  return await realtimeService.getGroupsByGroupId(groupId);
}
