import { Status, RewardRevokeCreditType, ActionType } from "@prisma/client";

export interface RewardRevoke {
  id: string;
  userId: number;
  type: ActionType;
  creditType: RewardRevokeCreditType;
  amount: string;
  reason: string;
  createdAt: Date;
  approvedAt: Date | null;
  status: Status;
  registrantId: string;
  approverId: string | null;
  registrant?: { nickname: string };
  approver?: { nickname: string };
}

export interface CreditTableData {
  records: RewardRevoke[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface CreateRewardRevokeData {
  userId: string;
  creditType: RewardRevokeCreditType;
  type: ActionType;
  amount: string;
  reason: string;
}

export interface UpdateRewardRevokeData extends CreateRewardRevokeData {}

export interface GameData {
  user_id: number;
  amount: string;
  type: ActionType;
}

export interface RewardRevokeResult {
  deleteResult?: RewardRevoke;
  updateResult?: RewardRevoke;
  logResult: {
    id: string;
    content: string;
    registrantId: string;
    createdAt: Date;
  };
}
