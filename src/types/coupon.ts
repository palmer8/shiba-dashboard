import { CouponGroupStatus, CouponGroupType, Prisma } from "@prisma/client";

export interface CouponFilter {
  startDate?: string;
  endDate?: string;
  groupStatus?: CouponGroupStatus;
  groupType?: CouponGroupType | "ALL";
  groupReason?: string;
  page?: number;
}

export interface CouponGroup {
  id: string;
  groupName: string;
  groupType: CouponGroupType;
  groupReason: string;
  groupStatus: CouponGroupStatus;
  code: string | null;
  rewards: Prisma.JsonValue;
  isIssued: boolean;
  quantity: number;
  usageLimit: number | null;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  code: string | null;
  rewards: any[];
  isUsed: boolean;
  couponGroupId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponGroupList {
  couponGroups: CouponGroup[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface CouponList {
  coupons: Coupon[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

// 기존 타입들 유지...

export interface CouponLogFilter {
  userId?: number;
  nickname?: string;
  startDate?: string;
  endDate?: string;
}

export interface CouponLog {
  id: string;
  userId: number;
  nickname: string;
  couponId: string | null;
  usedAt: Date;
  coupon?: {
    id: string;
    code: string | null;
    couponGroup: {
      groupName: string;
      groupType: string;
    } | null;
  } | null;
}
