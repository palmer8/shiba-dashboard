type UpdateUserDataDto = {
  isOnline: boolean;
  success: boolean;
  finalAmount: number;
  itemName: string;
};

type UpdateUserInventoryDto = {
  user_id: string;
  itemcode: string;
  amount: number;
  type: "add" | "remove";
};

type RemoveUserVehicleDto = {
  user_id: number;
  vehicle: string;
};

type RemoveUserWeaponDto = {
  user_id: number;
  weapon: string;
};

type UpdateUserGroupDto = {
  user_id: number;
  group: string;
  action: "remove" | "add";
};

export type {
  UpdateUserDataDto,
  RemoveUserVehicleDto,
  RemoveUserWeaponDto,
  UpdateUserInventoryDto,
  UpdateUserGroupDto,
};
