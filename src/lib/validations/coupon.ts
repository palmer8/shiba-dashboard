import { z } from "zod";

export const couponGroupSchema = z
  .object({
    groupName: z.string().min(1, "그룹 이름은 필수입니다"),
    groupReason: z.string().min(1, "발급 사유는 필수입니다"),
    groupType: z.string().min(1, "쿠폰 유형은 필수입니다"),
    code: z.string(),
    startDate: z.date({
      required_error: "시작 날짜는 필수입니다",
      invalid_type_error: "올바른 날짜를 입력해주세요",
    }),
    endDate: z.date({
      required_error: "종료 날짜는 필수입니다",
      invalid_type_error: "올바른 날짜를 입력해주세요",
    }),
    usageLimit: z
      .number()
      .min(1, "사용 횟수는 1 이상이어야 합니다")
      .max(999999, "사용 횟수가 너무 큽니다"),
    rewards: z
      .array(
        z.object({
          id: z.string().min(1, "아이템을 선택해주세요"),
          name: z.string(),
          count: z
            .number()
            .min(1, "수량은 1 이상이어야 합니다")
            .max(999999, "수량이 너무 큽니다"),
        })
      )
      .min(1, "보상 정보는 필수입니다"),
    quantity: z.number({
      required_error: "발급 수는 필수입니다",
      invalid_type_error: "발급 수는 숫자여야 합니다",
    }),
  })
  .refine(
    (data) => {
      if (data.groupType === "PUBLIC") {
        return /^[A-Za-z0-9]{8}$/.test(data.code);
      }
      return true;
    },
    {
      path: ["code"],
      message: "쿠폰 번호는 8자리 영문자와 숫자의 조합이어야 합니다",
    }
  )
  .refine(
    (data) => {
      const now = new Date();
      return data.startDate >= now;
    },
    {
      path: ["startDate"],
      message: "시작 날짜는 현재 시간보다 이후여야 합니다",
    }
  )
  .refine(
    (data) => {
      return data.endDate > data.startDate;
    },
    {
      path: ["endDate"],
      message: "종료 날짜는 시작 날짜보다 이후여야 합니다",
    }
  );

export type CouponGroupValues = z.infer<typeof couponGroupSchema>;

export const editCouponGroupSchema = z
  .object({
    groupName: z.string().min(1, "그룹 이름은 필수입니다"),
    groupReason: z.string().min(1, "발급 사유는 필수입니다"),
    groupType: z.string().min(1, "쿠폰 유형은 필수입니다"),
    code: z.string(),
    startDate: z.date({
      required_error: "시작 날짜는 필수입니다",
      invalid_type_error: "올바른 날짜를 입력해주세요",
    }),
    endDate: z.date({
      required_error: "종료 날짜는 필수입니다",
      invalid_type_error: "올바른 날짜를 입력해주세요",
    }),
    usageLimit: z
      .number()
      .min(1, "사용 횟수는 1 이상이어야 합니다")
      .max(999999, "사용 횟수가 너무 큽니다"),
    rewards: z
      .array(
        z.object({
          id: z.string().min(1, "아이템을 선택해주세요"),
          name: z.string(),
          count: z
            .number()
            .min(1, "수량은 1 이상이어야 합니다")
            .max(999999, "수량이 너무 큽니다"),
        })
      )
      .min(1, "보상 정보는 필수입니다"),
    quantity: z.number({
      required_error: "발급 수는 필수입니다",
      invalid_type_error: "발급 수는 숫자여야 합니다",
    }),
  })
  .refine(
    (data) => {
      if (data.groupType === "PUBLIC") {
        return /^[A-Za-z0-9]{8}$/.test(data.code);
      }
      return true;
    },
    {
      path: ["code"],
      message: "쿠폰 번호는 8자리 영문자와 숫자의 조합이어야 합니다",
    }
  )
  .refine(
    (data) => {
      const now = new Date();
      return data.startDate >= now;
    },
    {
      path: ["startDate"],
      message: "시작 날짜는 현재 시간보다 이후여야 합니다",
    }
  )
  .refine(
    (data) => {
      return data.endDate > data.startDate;
    },
    {
      path: ["endDate"],
      message: "종료 날짜는 시작 날짜보다 이후여야 합니다",
    }
  );

export type EditCouponGroupValues = z.infer<typeof editCouponGroupSchema>;
