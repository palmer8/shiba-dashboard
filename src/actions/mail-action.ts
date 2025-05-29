"use server";

import { revalidatePath } from "next/cache";
import {
  getPersonalMails,
  createPersonalMail,
  deletePersonalMail,
  getGroupMailReserves,
  createGroupMailReserve,
  updateGroupMailReserve,
  deleteGroupMailReserve,
  getGroupMailReserveLogs,
} from "@/service/mail-service";
import {
  personalMailCreateSchema,
  groupMailReserveCreateSchema,
  groupMailReserveEditSchema,
  PersonalMailCreateValues,
  GroupMailReserveCreateValues,
  GroupMailReserveEditValues,
} from "@/lib/validations/mail";
import {
  PersonalMailFilter,
  GroupMailReserveFilter,
  GroupMailReserveLogFilter,
  MailApiResponse,
} from "@/types/mail";

// 개인 우편 액션들
export async function getPersonalMailsAction(
  page: number = 0,
  filter: PersonalMailFilter
) {
  try {
    const result = await getPersonalMails(page, filter);
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "개인 우편 조회 실패",
    };
  }
}

export async function createPersonalMailAction(values: PersonalMailCreateValues) {
  try {
    const validatedData = personalMailCreateSchema.parse(values);
    const result = await createPersonalMail(validatedData);
    
    revalidatePath("/game/mail");
    
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "개인 우편 생성 실패",
    };
  }
}

export async function deletePersonalMailAction(id: number) {
  try {
    await deletePersonalMail(id);
    
    revalidatePath("/game/mail");
    
    return {
      success: true,
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "개인 우편 삭제 실패",
    };
  }
}

// 단체 우편 예약 액션들
export async function getGroupMailReservesAction(
  page: number = 0,
  filter: GroupMailReserveFilter
) {
  try {
    const result = await getGroupMailReserves(page, filter);
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "단체 우편 예약 조회 실패",
    };
  }
}

export async function createGroupMailReserveAction(values: GroupMailReserveCreateValues) {
  try {
    const validatedData = groupMailReserveCreateSchema.parse(values);
    const result = await createGroupMailReserve(validatedData);
    
    revalidatePath("/game/group-mail");
    
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "단체 우편 예약 생성 실패",
    };
  }
}

export async function updateGroupMailReserveAction(
  id: number,
  values: GroupMailReserveEditValues
) {
  try {
    const validatedData = groupMailReserveEditSchema.parse(values);
    const result = await updateGroupMailReserve(id, validatedData);
    
    revalidatePath("/game/group-mail");
    
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "단체 우편 예약 수정 실패",
    };
  }
}

export async function deleteGroupMailReserveAction(id: number) {
  try {
    await deleteGroupMailReserve(id);
    
    revalidatePath("/game/group-mail");
    
    return {
      success: true,
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "단체 우편 예약 삭제 실패",
    };
  }
}

// 단체 우편 수령 로그 액션
export async function getGroupMailReserveLogsAction(
  page: number = 1,
  filter: GroupMailReserveLogFilter
) {
  try {
    const result = await getGroupMailReserveLogs(page, filter);
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "단체 우편 수령 로그 조회 실패",
    };
  }
}
