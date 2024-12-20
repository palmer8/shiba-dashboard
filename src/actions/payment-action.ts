"use server";

import { paymentService } from "@/service/payment-service";

export async function getPaymentsByIdsOriginAction(ids: number[]) {
  const result = await paymentService.getPaymentByIdsToOrigin(ids);
  return result;
}
