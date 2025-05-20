export type ComparisonOperator = "gt" | "gte" | "lt" | "lte" | "eq";

export type GameDataType =
  | "CREDIT"
  | "CREDIT2"
  | "WALLET"
  | "BANK"
  | "MILEAGE"
  | "REGISTRATION"
  | "CURRENT_CASH"
  | "ACCUMULATED_CASH"
  | "ITEM_CODE"
  | "ITEM_NAME"
  | "NICKNAME"
  | "INSTAGRAM"
  | "COMPANY"
  | "IP"
  | "VEHICLE";

export type UserLogFilter = {
  message?: string;
  createdAt?: [string, string];
  level?: string;
  type?: string;
  page?: number;
};

export interface InstagramResult {
  id: number;
  nickname: string;
  first_join: Date;
  display_name: string;
  username: string;
  phone_number: string;
  date_joined: Date;
}

export interface IpResult {
  id: number;
  nickname: string;
  first_join: Date;
  result: string;
}

export interface CompanyResult {
  id: number;
  name: string;
  capital: number;
}

export interface BaseQueryResult {
  id: number;
  nickname: string;
  first_join: Date;
  result: string;
  type: string;
}

export interface VehicleQueryResult {
  id: number;
  nickname: string;
  first_join: Date | null;
  vehicle: string;
  vehicle_plate: string | null;
}
