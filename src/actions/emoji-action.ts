"use server";

import { emojiService } from "@/service/emoji-service";
import { AddEmojiData, RemoveEmojiData } from "@/types/emoji";
import { ApiResponse } from "@/types/global.dto";
import { revalidatePath } from "next/cache";
import { realtimeService } from "@/service/realtime-service";

export async function addEmojiToUserAction(
  data: AddEmojiData
): Promise<ApiResponse<boolean>> {
  try {
    const result = await emojiService.addEmojiToUser(data.userId, data.emoji);

    if (result.success) {
      const reloadResult = await realtimeService.reloadPlayerData(data.userId);
      revalidatePath("/game/emoji");

      return {
        success: result.success,
        data: result.data,
        error: result.error,
      };
    }

    return result;
  } catch (error) {
    console.error("Add emoji action error:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "이모지 추가 중 오류가 발생했습니다.",
    };
  }
}

export async function removeEmojiFromUserAction(
  data: RemoveEmojiData
): Promise<ApiResponse<boolean>> {
  try {
    const result = await emojiService.removeEmojiFromUser(
      data.userId,
      data.emoji
    );

    if (result.success) {
      const reloadResult = await realtimeService.reloadPlayerData(data.userId);
      revalidatePath("/game/emoji");

      return {
        success: result.success,
        data: result.data,
        error: result.error,
      };
    }

    return result;
  } catch (error) {
    console.error("Remove emoji action error:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "이모지 제거 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 이모지 데이터를 JSON 형태로 반출합니다.
 */
export async function getEmojiJsonDataAction(): Promise<
  ApiResponse<Record<string, number[]>>
> {
  try {
    const result = await emojiService.getEmojiJsonData();
    return result;
  } catch (error) {
    console.error("Get emoji JSON data action error:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "이모지 데이터 반출 중 오류가 발생했습니다.",
    };
  }
}
