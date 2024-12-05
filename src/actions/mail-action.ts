"use server";

import { GroupMailValues } from "@/components/dialog/add-group-mail-dialog";
import { PersonalMailValues } from "@/components/dialog/add-personal-mail-dialog";
import { mailService } from "@/service/mail-service";
import { revalidatePath } from "next/cache";

export async function getGroupMailsByIdsOrigin(ids: string[]) {
  const result = await mailService.getGroupMailsByIds(ids);
  return result;
}

export async function createGroupMailAction(data: GroupMailValues) {
  const result = await mailService.createGroupMail(data);
  revalidatePath("/game/group-mail");
  return result;
}

export async function updateGroupMailAction(
  id: string,
  data: Partial<GroupMailValues>
) {
  const result = await mailService.updateGroupMail(id, data);
  revalidatePath("/game/group-mail");
  return result;
}

export async function deleteGroupMailAction(id: string) {
  const result = await mailService.deleteGroupMail(id);
  revalidatePath("/game/group-mail");
  return result;
}

export async function createPersonalMailAction(data: PersonalMailValues) {
  const result = await mailService.createPersonalMail(data);
  revalidatePath("/game/personal-mail");
  return result;
}

export async function updatePersonalMailAction(
  id: string,
  data: Partial<PersonalMailValues>
) {
  const result = await mailService.updatePersonalMail(id, data);
  revalidatePath("/game/personal-mail");
  return result;
}

export async function deletePersonalMailAction(id: string) {
  const result = await mailService.deletePersonalMail(id);
  revalidatePath("/game/personal-mail");
  return result;
}

export async function getPersonalMailsByIdsOrigin(ids: string[]) {
  const result = await mailService.getPersonalMailsByIdsOrigin(ids);
  return result;
}
