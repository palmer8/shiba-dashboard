type IncidentReportFilter = {
  penaltyType?: string;
  reason?: string;
  targetUserId?: number;
  reportingUserId?: number;
  admin?: string;
};

type WhiteListFilter = {
  userId: number;
  ip?: string;
  admin?: string;
};

export type { IncidentReportFilter, WhiteListFilter };
