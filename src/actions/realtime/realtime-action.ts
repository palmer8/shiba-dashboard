"use server";

import { realtimeService } from "@/service/realtime-service";
import { UserMemo } from "@/types/realtime";
import { DateRange } from "react-day-picker";
import { ApiResponse } from "@/types/global.dto";

export type ChangeUserIdResponseData = {
  lastLoginDate: string | null;
  isCurrentUserOnline: boolean;
  changed?: boolean;
  isNewUserIdExists?: boolean;
};

export async function returnPlayerSkinAction(userId: number) {
  const result = await realtimeService.returnPlayerSkin(userId);
  return result;
}

export async function updateCompanyCapitalAction(
  companyId: number,
  capital: number
) {
  const result = await realtimeService.updateCompanyCapital(companyId, capital);
  return result;
}

export async function playerBanAction(
  userId: number,
  reason: string,
  duration: number,
  type: "ban" | "unban"
) {
  const result = await realtimeService.playerBan(
    userId,
    reason,
    duration.toString(),
    type
  );
  return result;
}

export async function deleteMemoAction(memo: UserMemo) {
  const result = await realtimeService.deleteMemo(memo);
  return result;
}

export async function createMemoAction(
  userId: number,
  adminName: string,
  text: string
) {
  const result = await realtimeService.createMemo(userId, adminName, text);
  return result;
}

export async function updateMemoAction(originData: UserMemo, text: string) {
  const result = await realtimeService.updateMemo(originData, text);
  return result;
}

export async function getUserDataAction(userId: number) {
  const result = await realtimeService.getGameUserDataByUserId(userId);
  return result;
}

export async function createChunobotAction(
  userId: number,
  adminName: string,
  reason: string
) {
  const result = await realtimeService.createChunobot(
    userId,
    adminName,
    reason
  );
  return result;
}

export async function updateChunobotAction(userId: number, reason: string) {
  const result = await realtimeService.updateChunobot(userId, reason);
  return result;
}

export async function deleteChunobotAction(userId: number) {
  const result = await realtimeService.deleteChunobot(userId);
  return result;
}

export async function updateJailAction(
  userId: number,
  time: number,
  reason: string,
  isAdmin: boolean
) {
  const result = await realtimeService.updateJail(
    userId,
    time,
    reason,
    isAdmin
  );
  return result;
}

export async function reloadPlayerDataAction(userId: number) {
  const result = await realtimeService.reloadPlayerData(userId);
  return result;
}

/**
 * 사용자의 Discord ID를 업데이트하는 서버 액션
 * @param gameUserId 게임 유저 ID
 * @param newDiscordId 새로운 Discord 사용자 ID (숫자 문자열)
 */
export async function updateUserDiscordIdAction(
  gameUserId: number,
  newDiscordId: string
) {
  const result = await realtimeService.updateUserDiscordId(
    gameUserId,
    newDiscordId
  );
  return result;
}

export async function changeUserIdAction(
  currentUserId: number,
  newUserId: number,
  confirm: boolean
): Promise<ApiResponse<ChangeUserIdResponseData>> {
  const result = await realtimeService.changeUserId(
    currentUserId,
    newUserId,
    confirm
  );
  return result;
}

export async function changeUserIdentityAction(
  userId: number,
  registration?: string,
  phone?: string
) {
  const result = await realtimeService.changeUserIdentity(
    userId,
    registration,
    phone
  );
  return result;
}

export async function getAttendanceRecordsWithUsersAction() {
  const result = await realtimeService.getAttendanceRecordsWithUser();
  return result;
}

export async function getAttendanceRecordsForUserAction(
  userNumericId: number,
  dateRange: DateRange | undefined
) {
  const result = await realtimeService.getAttendanceRecordsForUser(
    userNumericId,
    dateRange
  );
  return result;
}
export async function updateWarningCountAction(
  userId: number,
  newCount: number
) {
  const result = await realtimeService.setWarningCount(userId, newCount);
  return result;
}

export async function setWarningCountAction(userId: number, count: number) {
  const result = await realtimeService.setWarningCount(userId, count);
  return result;
}

export async function getMyTodayAttendanceAction() {
  return await realtimeService.getMyTodayAttendance();
}

export async function getMyAttendanceRecordsAction() {
  return await realtimeService.getMyAttendanceRecords();
}
