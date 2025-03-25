import { z } from "zod";
import { RewardRevokeCreditType, ActionType, Status } from "@prisma/client";

// 재화 지급/회수 생성 스키마
export const createCreditSchema = z.object({
  userId: z
    .string({
      required_error: "고유번호를 입력해주세요",
    })
    .min(1, "고유번호를 입력해주세요"),
  creditType: z.string({
    required_error: "재화 종류를 선택해주세요",
  }),
  type: z.nativeEnum(ActionType, {
    required_error: "유형을 선택해주세요",
  }),
  amount: z
    .string()
    .min(1, "수량을 입력해주세요")
    .refine((val) => Number(val) > 0, "0보다 큰 값을 입력하세요"),
  reason: z
    .string()
    .min(1, "사유를 입력해주세요")
    .max(50, "사유는 50자를 초과할 수 없습니다"),
  nickname: z.string({
    message: "존재하지 않는 유저입니다.",
  }),
});

// 재화 지급/회수 수정 스키마
export const editCreditSchema = createCreditSchema.extend({
  status: z.nativeEnum(Status, {
    required_error: "상태를 선택해주세요",
  }),
});

// 재화 필터 스키마
export const creditFilterSchema = z.object({
  status: z.nativeEnum(Status).optional(),
  type: z.nativeEnum(ActionType).optional(),
  creditType: z
    .string({
      required_error: "재화 종류를 선택해주세요",
    })
    .optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  searchType: z.enum(["userId", "registrantId", "approverId"]).optional(),
  searchValue: z.string().optional(),
});

// 타입 추출
export type CreateCreditValues = z.infer<typeof createCreditSchema>;
export type EditCreditValues = z.infer<typeof editCreditSchema>;
export type CreditFilterValues = z.infer<typeof creditFilterSchema>;

// 상수
export const CREDIT_TYPE_MAP: Record<string, string> = {
  MONEY: "현금",
  BANK: "계좌",
  CREDIT: "무료 캐시",
  CREDIT2: "유료 캐시",
  CURRENT_COIN: "마일리지",
} as const;

export const ACTION_TYPE_MAP: Record<ActionType, string> = {
  ADD: "지급",
  REMOVE: "회수",
} as const;

export const STATUS_MAP: Record<Status, string> = {
  PENDING: "대기중",
  APPROVED: "승인됨",
  REJECTED: "거절됨",
  CANCELLED: "취소됨",
} as const;
