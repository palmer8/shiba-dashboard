import { ActionType, RewardRevokeCreditType, Status } from "@prisma/client";

export type CreditFilter = {
  startDate?: string;
  endDate?: string;
  approveStartDate?: string;
  approveEndDate?: string;
  userId?: number;
  type?: ActionType;
  creditType?: RewardRevokeCreditType;
  status: Status;
};
