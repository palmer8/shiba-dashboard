export interface GroupMailFilter {
  startDate?: string;
  endDate?: string;
  reason?: string;
  userId?: number;
}

export interface PersonalMailFilter {
  startDate?: string;
  endDate?: string;
  reason?: string;
  registrantUserId?: number;
  userId?: number;
}
