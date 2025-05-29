import { z } from "zod";
import type { CouponDisplayType } from "@/types/coupon";

// 보상 아이템 스키마
const rewardItemSchema = z.object({
  itemCode: z.string().min(1, "아이템 코드를 선택해주세요"),
  itemName: z.string().min(1, "아이템 이름이 필요합니다"),
  count: z
    .number()
    .int("수량은 정수여야 합니다")
    .min(1, "수량은 1 이상이어야 합니다")
    .max(999999, "수량이 너무 큽니다"),
});

// 쿠폰 생성 스키마
export const couponCreateSchema = z
  .object({
    name: z
      .string()
      .min(1, "쿠폰명은 필수입니다")
      .max(255, "쿠폰명은 255자 이하여야 합니다")
      .trim(),
    type: z.enum(["일반", "퍼블릭"] as const, {
      required_error: "쿠폰 유형을 선택해주세요",
      invalid_type_error: "올바른 쿠폰 유형을 선택해주세요",
    }) as z.ZodType<CouponDisplayType>,
    code: z.string().optional(), // 퍼블릭 쿠폰용 고정 코드
    quantity: z
      .number()
      .int("발급 수는 정수여야 합니다")
      .min(1, "발급 수는 1 이상이어야 합니다")
      .max(100000, "발급 수가 너무 큽니다")
      .optional(), // 일반 쿠폰용
    maxcount: z
      .number()
      .int("사용 제한은 정수여야 합니다")
      .min(1, "사용 제한은 1 이상이어야 합니다")
      .max(999999, "사용 제한이 너무 큽니다")
      .optional(), // 퍼블릭 쿠폰용
    start_time: z
      .string()
      .min(1, "시작일시는 필수입니다")
      .refine((val) => !isNaN(Date.parse(val)), "올바른 날짜 형식이 아닙니다"),
    end_time: z
      .string()
      .min(1, "종료일시는 필수입니다")
      .refine((val) => !isNaN(Date.parse(val)), "올바른 날짜 형식이 아닙니다"),
    reward_items: z
      .array(rewardItemSchema)
      .min(1, "최소 1개의 보상 아이템이 필요합니다")
      .max(10, "보상 아이템은 최대 10개까지 가능합니다"),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      return start < end;
    },
    {
      message: "종료일시는 시작일시보다 늦어야 합니다",
      path: ["end_time"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "일반") {
        return data.quantity && data.quantity > 0;
      }
      return true;
    },
    {
      message: "일반 쿠폰은 발급 수량이 필요합니다",
      path: ["quantity"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "퍼블릭") {
        return data.code && data.code.trim().length > 0;
      }
      return true;
    },
    {
      message: "퍼블릭 쿠폰은 고정 코드가 필요합니다",
      path: ["code"],
    }
  );

// 쿠폰 수정 스키마
export const couponEditSchema = z
  .object({
    name: z
      .string()
      .min(1, "쿠폰명은 필수입니다")
      .max(255, "쿠폰명은 255자 이하여야 합니다")
      .trim(),
    maxcount: z
      .number()
      .int("사용 제한은 정수여야 합니다")
      .min(1, "사용 제한은 1 이상이어야 합니다")
      .max(999999, "사용 제한이 너무 큽니다")
      .optional(),
    start_time: z
      .string()
      .min(1, "시작일시는 필수입니다")
      .refine((val) => !isNaN(Date.parse(val)), "올바른 날짜 형식이 아닙니다"),
    end_time: z
      .string()
      .min(1, "종료일시는 필수입니다")
      .refine((val) => !isNaN(Date.parse(val)), "올바른 날짜 형식이 아닙니다"),
    reward_items: z
      .array(rewardItemSchema)
      .min(1, "최소 1개의 보상 아이템이 필요합니다")
      .max(10, "보상 아이템은 최대 10개까지 가능합니다"),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      return start < end;
    },
    {
      message: "종료일시는 시작일시보다 늦어야 합니다",
      path: ["end_time"],
    }
  );

export type CouponCreateValues = z.infer<typeof couponCreateSchema>;
export type CouponEditValues = z.infer<typeof couponEditSchema>;

// 쿠폰 로그 필터 스키마
export const couponLogFilterSchema = z.object({
  userId: z.number().int().positive().optional(),
  couponCode: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
});

export type CouponLogFilterValues = z.infer<typeof couponLogFilterSchema>;
