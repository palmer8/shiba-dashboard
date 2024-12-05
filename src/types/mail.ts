export type GroupMailReward = {
  type: "ITEM" | "MONEY" | "BANK" | "CREDIT" | "CREDIT2";
  itemId?: string;
  itemName?: string;
  amount: string;
};

export interface GroupMail {
  id: string;
  reason: string;
  content: string;
  rewards: GroupMailReward[];
  startDate: Date;
  endDate: Date;
  registrantId: string | null;
  registrant?: {
    nickname: string;
    userId: number;
    id: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMailTableData {
  records: GroupMail[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface PersonalMail {
  id: string;
  reason: string;
  content: string;
  userId: number;
  rewards: GroupMailReward[];
  needItems: GroupMailReward[];
  startDate: Date;
  endDate: Date;
  registrantId: string | null;
  registrant?: {
    nickname: string;
    userId: number;
    id: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalMailTableData {
  records: PersonalMail[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
}
