"use server";

import { couponService } from "@/service/coupon-service";
import { CouponGroupValues } from "@/lib/validations/coupon";
import { revalidatePath } from "next/cache";
import { CouponGroup } from "@/types/coupon";
import { ApiResponse } from "@/types/global.dto";

export async function createCouponGroupAction(couponValues: CouponGroupValues) {
  const result = await couponService.createCouponGroup(couponValues);
  if (result.success) revalidatePath("/coupon");
  return result;
}

export async function createCouponsAction(selectedGroups: CouponGroup[]) {
  const result = await couponService.createCoupons(selectedGroups);
  if (result.success) revalidatePath("/coupon");
  return result;
}

export async function getCouponsByGroupIdAction(
  couponGroupId: string,
  page: number = 0
) {
  const result = await couponService.getCouponsByGroupId(couponGroupId, page);
  return result;
}

export async function deleteCouponGroupWithCouponsAction(
  couponGroupId: string
): Promise<ApiResponse<CouponGroup>> {
  const result = await couponService.deleteCouponGroupWithCoupons(
    couponGroupId
  );
  if (result.success) revalidatePath("/coupon");
  return result;
}

export async function updateCouponGroupAction(
  id: string,
  data: Partial<CouponGroupValues>
) {
  const result = await couponService.updateCouponGroup(id, data);
  revalidatePath("/coupon");
  return result;
}

export async function getCouponGroupWithCouponsAndIdsAction(ids: string[]) {
  const result = await couponService.getCouponGroupWithCouponsAndIds(ids);
  return result;
}
