export type ComparisonOperator = "gt" | "gte" | "lt" | "lte" | "eq";

export type GameDataType =
  | "ITEM"
  | "CREDIT"
  | "CREDIT2"
  | "WALLET"
  | "BANK"
  | "MILEAGE"
  | "REGISTRATION"
  | "CURRENT_CASH"
  | "ACCUMULATED_CASH";

export type UserLogFilter = {
  message?: string;
  createdAt?: [string, string];
  level?: string;
  type?: string;
  page?: number;
};
