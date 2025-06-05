// 데이터베이스 저장용 쿠폰 타입 (영문)
export type CouponDbType = "general" | "public";

// UI 표시용 쿠폰 타입 (한글)
export type CouponDisplayType = "일반" | "퍼블릭";

// 쿠폰 타입 변환 유틸리티
export const COUPON_TYPE_MAP: Record<CouponDisplayType, CouponDbType> = {
  "일반": "general",
  "퍼블릭": "public"
};

export const COUPON_TYPE_REVERSE_MAP: Record<CouponDbType, CouponDisplayType> = {
  "general": "일반",
  "public": "퍼블릭"
};

// 쿠폰 타입 (dokku_coupon 테이블)
export interface Coupon {
  id: number;
  name: string;
  type: CouponDbType; // 데이터베이스에는 영문으로 저장
  reward_items: Record<string, number>; // { "아이템코드": 수량 }
  maxcount: number | null; // 퍼블릭 쿠폰의 사용 제한 횟수
  start_time: Date;
  end_time: Date;
  created_at: Date;
  _count?: {
    codes: number;
    usedCodes: number;
  };
}

// UI에서 사용할 쿠폰 타입 (한글 표시용)
export interface CouponDisplay extends Omit<Coupon, 'type' | 'reward_items'> {
  type: CouponDisplayType;
  reward_items: Record<string, { name: string; amount: number }>;
}

// 쿠폰 코드 타입 (dokku_coupon_code 테이블)
export interface CouponCode {
  coupon_idx: number;
  code: string;
}

// 쿠폰 사용 로그 타입 (dokku_coupon_code_log 테이블)
export interface CouponCodeLog {
  coupon_idx: number;
  coupon_code: string;
  user_id: number;
  time: Date;
  coupon?: CouponDisplay; // UI 표시용 쿠폰 정보
  nickname?: string; // 조인된 유저 닉네임
}

// 쿠폰 목록 응답 타입
export interface CouponList {
  coupons: (Coupon & {
    _count?: {
      codes: number;
      usedCodes: number;
    };
  })[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 쿠폰 필터 타입
export interface CouponFilter {
  name?: string;
  type?: CouponDisplayType | "ALL";
  startDate?: string;
  endDate?: string;
  page?: number;
}

// 쿠폰 로그 필터 타입
export interface CouponLogFilter {
  userId?: number;
  couponCode?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}

// 쿠폰 로그 목록 응답 타입 (조인된 데이터)
export interface CouponLogList {
  records: (CouponCodeLog & {
    coupon?: CouponDisplay;
    nickname?: string;
  })[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 보상 아이템 타입 (UI용)
export interface RewardItem {
  itemCode: string;
  itemName: string;
  count: number;
}

// API 응답 타입
export interface CouponApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
