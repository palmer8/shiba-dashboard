import { ActionType } from "@prisma/client";
import { z } from "zod";

export const ItemQuantitySchema = z.object({
  userId: z
    .string({
      required_error: "고유번호를 입력해주세요",
    })
    .min(1, "고유번호를 입력해주세요"),
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
  itemId: z.string().min(1, "아이템을 선택해주세요"),
  itemName: z.string().min(1, "아이템을 선택해주세요"),
  amount: z.string().min(1, "수량을 입력해주세요"),
  type: z.nativeEnum(ActionType),
  reason: z.string().min(1, "사유를 입력해주세요"),
});

export type ItemQuantityValues = z.infer<typeof ItemQuantitySchema>;
