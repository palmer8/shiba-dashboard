"use server";

import { GroupMailValues } from "@/components/dialog/add-group-mail-dialog";
import { PersonalMailValues } from "@/components/dialog/add-personal-mail-dialog";
import { mailService } from "@/service/mail-service";
import { revalidatePath } from "next/cache";
import { parsePersonalMailCSV } from "@/lib/utils";

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

export async function uploadPersonalMailCSVAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return {
        success: false,
        message: "파일이 선택되지 않았습니다.",
        data: null,
        error: "No file selected",
      };
    }

    const fileContent = await file.text();
    const records = parsePersonalMailCSV(fileContent);
    const result = await mailService.createPersonalMailsFromCSV(records);
    if (result.success) {
      revalidatePath("/game/personal-mail");
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: "CSV 파일 처리 중 오류가 발생했습니다.",
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 에러가 발생하였습니다",
    };
  }
}
