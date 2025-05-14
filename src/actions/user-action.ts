"use server";

import { userService } from "@/service/user-service";
import { ApiResponse } from "@/types/global.dto";
import { SignUpUser, UpdateProfileData } from "@/types/user";
import { User, UserRole } from "@prisma/client";
import { SignUpFormValues } from "@/lib/validations/auth";
import { auth } from "@/lib/auth-config";

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

export async function updateUserByMasterAction(
  targetUserIdToUpdate: string,
  data: any
): Promise<ApiResponse<User>> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.role || !session?.user?.nickname) {
    return {
      success: false,
      error:
        "인증되지 않은 사용자이거나 필수 정보(ID, 역할, 닉네임)가 없습니다.",
      data: null,
    };
  }

  const result = await userService.updateUserByMaster(
    session.user.id,
    session.user.role as UserRole,
    session.user.nickname,
    targetUserIdToUpdate,
    data
  );
  return result;
}
