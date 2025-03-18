"use server";

import { emojiService } from "@/service/emoji-service";
import { AddEmojiData, RemoveEmojiData } from "@/types/emoji";
import { ApiResponse } from "@/types/global.dto";
import { revalidatePath } from "next/cache";

export async function addEmojiToUserAction(
  data: AddEmojiData
): Promise<ApiResponse<boolean>> {
  try {
    const result = await emojiService.addEmojiToUser(data.userId, data.emoji);

    if (result.success) {
      revalidatePath("/game/emoji");
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
      revalidatePath("/game/emoji");
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
