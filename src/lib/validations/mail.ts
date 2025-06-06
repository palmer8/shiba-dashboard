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

export const GroupMailSchema = z.object({
  reason: z.string().min(1, "제목을 입력해주세요"),
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
});

export type GroupMailValues = z.infer<typeof GroupMailSchema>;

export const editGroupMailSchema = z.object({
  reason: z.string().min(1, "제목을 입력해주세요"),
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
  title: z.string().min(1, "제목을 입력해주세요"),
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
  title: z.string().min(1, "제목을 입력해주세요"),
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

// 아이템 스키마
const mailItemSchema = z.object({
  itemCode: z.string().min(1, "아이템 코드를 입력해주세요"),
  count: z.number().min(1, "수량은 1 이상이어야 합니다"),
});

// 개인 우편 생성 스키마
export const personalMailCreateSchema = z.object({
  user_id: z.number().min(1, "유저 ID를 입력해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  need_items: z.array(mailItemSchema).optional().default([]),
  reward_items: z.array(mailItemSchema).min(1, "보상 아이템을 최소 1개 이상 추가해주세요"),
});

// 단체 우편 예약 생성 스키마
export const groupMailReserveCreateSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 100자 이하여야 합니다"),
  content: z.string().min(1, "내용을 입력해주세요"),
  start_time: z.string().min(1, "시작 시간을 입력해주세요"),
  end_time: z.string().min(1, "종료 시간을 입력해주세요"),
  rewards: z.array(mailItemSchema).min(1, "보상 아이템을 최소 1개 이상 추가해주세요"),
});

// 단체 우편 예약 수정 스키마
export const groupMailReserveEditSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 100자 이하여야 합니다"),
  content: z.string().min(1, "내용을 입력해주세요"),
  start_time: z.string().min(1, "시작 시간을 입력해주세요"),
  end_time: z.string().min(1, "종료 시간을 입력해주세요"),
  rewards: z.array(mailItemSchema).min(1, "보상 아이템을 최소 1개 이상 추가해주세요"),
});

// 타입 추출
export type PersonalMailCreateValues = z.infer<typeof personalMailCreateSchema>;
export type GroupMailReserveCreateValues = z.infer<typeof groupMailReserveCreateSchema>;
export type GroupMailReserveEditValues = z.infer<typeof groupMailReserveEditSchema>;
