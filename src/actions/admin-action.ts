"use server";

import { adminService } from "@/service/admin-service";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateDashboardUserRoleAction(
  id: string,
  role: UserRole
) {
  const result = await adminService.updateDashboardUserRole(id, role);
  revalidatePath("/admin");
  return result;
}

export async function removeDashboardUserAction(id: string) {
  const result = await adminService.removeDashboardUser(id);
  revalidatePath("/admin");
  return result;
}

export async function toggleDashboardUserPermissionAction(
  id: string,
  value: boolean
) {
  const result = await adminService.toggleDashboardUserPermission(id, value);
  revalidatePath("/admin");
  return result;
}

export async function updateGroupAction(groupId: string, minRole: UserRole) {
  const result = await adminService.updateGroup(groupId, minRole);
  revalidatePath("/admin/group");
  return result;
}

export async function resetUserPasswordAction(
  userId: number,
  password: string
) {
  const result = await adminService.resetUserPassword(userId, password);
  revalidatePath("/admin");
  return result;
}
