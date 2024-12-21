import { ApiResponse } from "./global.dto";

// Base Types
export interface RealtimeGroupData {
  user_id: string;
  name: string;
  first_join: string;
  last_datetime: string | null;
  last_nickname: string | null;
}

export interface RealtimeGroupResponse {
  users: RealtimeGroupData[];
  count: number;
  nextCursor?: number;
}

// DTO Types
export interface UpdateUserGroupDto {
  user_id: number;
  group: string;
  action: "remove" | "add";
}

export interface UpdateUserInventoryDto {
  user_id: string;
  itemcode: string;
  amount: number;
  type: "add" | "remove";
}

export interface RemoveUserVehicleDto {
  user_id: number;
  vehicle: string;
}

export interface RemoveUserWeaponDto {
  user_id: number;
  weapon: string;
}

// API Response Types
export type RealtimeGroupApiResponse = ApiResponse<RealtimeGroupResponse>;
export type UpdateUserGroupApiResponse = ApiResponse<boolean>;
export type UpdateUserInventoryApiResponse = ApiResponse<boolean>;
export type RemoveUserVehicleApiResponse = ApiResponse<boolean>;
export type RemoveUserWeaponApiResponse = ApiResponse<boolean>;
