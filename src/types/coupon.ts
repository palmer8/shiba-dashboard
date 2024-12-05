import { CouponGroupStatus, CouponGroupType, Prisma } from "@prisma/client";

export interface CouponFilter {
  startDate?: string;
  endDate?: string;
  groupStatus?: CouponGroupStatus;
  groupType?: CouponGroupType | "ALL";
  groupReason?: string;
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
