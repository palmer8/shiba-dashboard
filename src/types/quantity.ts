import {
  ItemQuantity as ItemQuantityModel,
  ActionType,
  Status,
} from "@prisma/client";

// 기본 아이템 수량 타입
export interface ItemQuantity extends ItemQuantityModel {
  registrant?: {
    nickname: string;
  } | null;
  approver?: {
    nickname: string;
  } | null;
}

// 테이블 데이터 타입
export interface ItemQuantityTableData {
  records: ItemQuantity[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
}

// 생성 요청 데이터 타입
export interface CreateItemQuantityData {
  userId: string;
  itemId: string;
  itemName: string;
  amount: string;
  type: ActionType;
  reason: string;
}

// 게임 업데이트 요청 데이터 타입
export interface UpdateUserGameData {
  user_id: string;
  itemcode: string;
  amount: number;
  type: "add" | "remove";
}
