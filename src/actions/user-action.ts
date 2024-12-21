"use server";

import { userService } from "@/service/user-service";
import { ApiResponse } from "@/types/global.dto";
import { SignUpUser, UpdateProfileData } from "@/types/user";
import { User } from "@prisma/client";
import { SignUpFormValues } from "@/lib/validations/auth";

export async function signUpAction(
  data: SignUpFormValues
): Promise<ApiResponse<SignUpUser>> {
  const result = await userService.signup(data);
  return result;
}

export async function getGameNicknameByUserIdAction(
  userId: number
): Promise<ApiResponse<string>> {
  const result = await userService.getGameNicknameByUserId(userId);
  return result;
}

export async function isAccountPermissiveAction(
  name: string,
  password: string
): Promise<ApiResponse<boolean>> {
  const result = await userService.isAccountPermissive(name, password);
  return result;
}

export async function getUserByIdAction(
  id: string
): Promise<ApiResponse<User>> {
  const result = await userService.getUserById(id);
  return result;
}

export async function updateUserAction(
  id: string,
  data: UpdateProfileData
): Promise<ApiResponse<User>> {
  const result = await userService.updateUser(id, data);
  return result;
}

export async function deleteUserAction(
  id: string,
  nickname: string
): Promise<ApiResponse<User>> {
  const result = await userService.deleteUser(id, nickname);
  return result;
}
