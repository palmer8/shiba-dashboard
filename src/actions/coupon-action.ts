"use server";

import { couponService } from "@/service/coupon-service";
import { CouponGroupValues } from "@/components/dialog/add-coupon-dialog";
import { revalidatePath } from "next/cache";
import { CouponGroup } from "@/types/coupon";

export async function createCouponGroupAction(couponValues: CouponGroupValues) {
  const result = await couponService.createCouponGroup(couponValues);
  revalidatePath("/coupon");
  return result;
}

export async function createCouponsAction(selectedGroups: CouponGroup[]) {
  const result = await couponService.createCoupons(selectedGroups);
  revalidatePath("/coupon");
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
) {
  const result = await couponService.deleteCouponGroupWithCoupons(
    couponGroupId
  );
  revalidatePath("/coupon");
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
