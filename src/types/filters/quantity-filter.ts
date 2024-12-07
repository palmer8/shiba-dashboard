import { Status } from "@prisma/client";

export interface ItemQuantityFilter {
  status: Status;
  startDate?: string;
  endDate?: string;
  approveStartDate?: string;
  approveEndDate?: string;
  userId?: number;
}
