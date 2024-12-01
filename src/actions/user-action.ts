"use server";

import { SignUpFormValues } from "@/components/form/signup-form";
import { userService } from "@/service/user-service";
import { GlobalReturn } from "@/types/global-return";
import { SignUpUser } from "@/types/user";
import { User, UserRole } from "@prisma/client";

export async function signUpAction(
  data: SignUpFormValues
): Promise<GlobalReturn<SignUpUser>> {
  const result = await userService.signup(data);
  return result;
}

export async function getGameNicknameByUserIdAction(
  userId: number
): Promise<GlobalReturn<string>> {
  const result = await userService.getGameNicknameByUserId(userId);
  return result;
}

export async function isAccessiblePageAction(
  userId: string,
  role: UserRole
): Promise<GlobalReturn<boolean>> {
  const result = await userService.isAccessiblePage(userId, role);
  return result;
}

export async function isAccountPermissiveAction(
  name: string,
  password: string
): Promise<GlobalReturn<boolean>> {
  const result = await userService.isAccountPermissive(name, password);
  return result;
}

export async function getUserByIdAction(
  id: string
): Promise<GlobalReturn<User>> {
  const result = await userService.getUserById(id);
  return result;
}
