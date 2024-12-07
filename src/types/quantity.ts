import {
  ItemQuantity as ItemQuantityModel,
  ActionType,
  Status,
} from "@prisma/client";

export interface ItemQuantity extends ItemQuantityModel {
  registrant?: {
    nickname: string;
  } | null;
  approver?: {
    nickname: string;
  } | null;
}

export type ItemQuantityTableData = {
  records: ItemQuantity[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
};

export type CreateItemQuantityData = {
  userId: string;
  itemId: string;
  itemName: string;
  amount: string;
  type: ActionType;
  reason: string;
};

export type UpdateItemQuantityData = {
  id: string;
  status: Status;
  approverId?: string;
};
