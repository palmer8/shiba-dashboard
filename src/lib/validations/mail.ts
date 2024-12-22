import { z } from "zod";

export const rewardSchema = z
  .object({
    type: z.enum(["MONEY", "BANK", "ITEM"]),
    itemId: z.string().optional(),
    itemName: z.string().optional(),
    amount: z.string(),
  })
  .refine(
    (data) => {
      if (data.type === "ITEM") {
        return data.itemId && data.itemName;
      }
      return true;
    },
    {
      message: "아이템 정보를 선택해주세요",
    }
  );

export const GroupMailSchema = z
  .object({
    reason: z.string().min(1, "사유를 입력해주세요"),
    content: z.string().min(10, "내용은 최소 10자 이상이어야 합니다"),
    rewards: z
      .array(rewardSchema)
      .min(1, "최소 1개 이상의 보상을 설정해주세요"),
    startDate: z.date({
      required_error: "시작 날짜를 입력해주세요",
    }),
    endDate: z.date({
      required_error: "종료 날짜를 입력해주세요",
    }),
  })
  .refine(
    (data) => {
      const now = new Date();
      now.setSeconds(0, 0); // 초와 밀리초를 0으로 설정하여 비교
      return data.startDate >= now;
    },
    {
      path: ["startDate"],
      message: "시작 날짜는 현재 시간 이후여야 합니다",
    }
  )
  .refine((data) => data.startDate < data.endDate, {
    path: ["endDate"],
    message: "종료 날짜는 시작 날짜보다 이후여야 합니다",
  });

export type GroupMailValues = z.infer<typeof GroupMailSchema>;

export const editGroupMailSchema = z
  .object({
    reason: z.string().min(1, "사유를 입력해주세요"),
    content: z.string().min(10, "내용은 최소 10자 이상이어야 합니다"),
    rewards: z
      .array(rewardSchema)
      .min(1, "최소 1개 이상의 보상을 설정해주세요"),
    startDate: z.date({
      required_error: "시작 날짜를 입력해주세요",
    }),
    endDate: z.date({
      required_error: "종료 날짜를 입력해주세요",
    }),
  })
  .refine(
    (data) => {
      const now = new Date();
      now.setSeconds(0, 0); // 초와 밀리초를 0으로 설정하여 비교
      return data.startDate >= now;
    },
    {
      path: ["startDate"],
      message: "시작 날짜는 현재 시간 이후여야 합니다",
    }
  )
  .refine((data) => data.startDate < data.endDate, {
    path: ["endDate"],
    message: "종료 날짜는 시작 날짜보다 이후여야 합니다",
  });

export type EditGroupMailValues = z.infer<typeof editGroupMailSchema>;

const NeedItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ITEM"),
    itemId: z.string().min(1, "아이템을 선택해주세요"),
    itemName: z.string().min(1, "아이템을 선택해주세요"),
    amount: z.string().min(1, "수량을 입력해주세요"),
  }),
  z.object({
    type: z.enum(["MONEY", "BANK"]),
    amount: z.string().min(1, "금액을 입력해주세요"),
  }),
]);

export const EditPersonalMailSchema = z.object({
  reason: z.string().min(1, "사유를 입력해주세요"),
  content: z.string().min(10, "내용은 최소 10자 이상이어야 합니다"),
  rewards: z.array(rewardSchema),
  needItems: z.array(NeedItemSchema).optional(),
  userId: z
    .string({
      required_error: "고유번호를 입력해주세요",
    })
    .min(1, "고유번호를 입력해주세요"),
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
});

export type EditPersonalMailValues = z.infer<typeof EditPersonalMailSchema>;

export const PersonalMailSchema = z.object({
  reason: z.string().min(1, "사유를 입력해주세요"),
  content: z.string().min(10, "내용은 최소 10자 이상이어야 합니다"),
  rewards: z.array(rewardSchema),
  needItems: z.array(NeedItemSchema).optional(),
  userId: z
    .string({
      required_error: "고유번호를 입력해주세요",
    })
    .min(1, "고유번호를 입력해주세요"),
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
});

export type PersonalMailValues = z.infer<typeof PersonalMailSchema>;
