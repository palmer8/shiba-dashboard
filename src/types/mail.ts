export type GroupMailReward = {
  type: "ITEM" | "MONEY" | "BANK";
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
  id: number;
  user_id: number;
  title: string;
  content: string;
  need_items: Record<string, number>;
  reward_items: Record<string, number>;
  used: boolean;
  created_at: Date;
  nickname?: string;
}

// UI 표시용 PersonalMail 타입 (아이템 이름 포함)
export interface PersonalMailDisplay {
  id: number;
  user_id: number;
  title: string;
  content: string;
  need_items: Record<string, { name: string; amount: number }>;
  reward_items: Record<string, { name: string; amount: number }>;
  used: boolean;
  created_at: Date;
  nickname?: string;
}

export interface PersonalMailTableData {
  records: PersonalMailDisplay[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface GroupMailReserve {
  id: number;
  title: string;
  content: string;
  start_time: Date;
  end_time: Date;
  rewards: Record<string, number>;
}

export interface GroupMailReserveLog {
  event_id: number;
  user_id: number;
  claimed_at: Date;
  nickname?: string;
}

export interface PersonalMailList {
  mails: PersonalMailDisplay[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GroupMailReserveList {
  reserves: GroupMailReserve[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GroupMailReserveLogList {
  logs: GroupMailReserveLog[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GroupMailLogTableData {
  records: GroupMailReserveLog[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface PersonalMailFilter {
  userId?: number;
  startDate?: string;
  endDate?: string;
  used?: boolean;
}

export interface GroupMailReserveFilter {
  title?: string;
  startDate?: string;
  endDate?: string;
}

export interface GroupMailReserveLogFilter {
  eventId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

export interface MailItem {
  itemCode: string;
  count: number;
}

export interface MailApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 메일 템플릿 타입
export interface MailTemplate {
  id: string;
  title: string;
  content: string;
  registrantId: string | null;
  registrant?: {
    nickname: string;
    userId: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MailTemplateList {
  templates: MailTemplate[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 메일 발송 타입 (보상/사용 여부 제외)
export interface SimpleMailData {
  user_id: number;
  title: string;
  content: string;
}

export interface SimpleMailCreateValues {
  user_id: number;
  title: string;
  content: string;
  nickname: string;
}
