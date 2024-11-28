import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isNumberInput(e: React.ChangeEvent<HTMLInputElement>) {
  const value = e.target.value.replace(/[^0-9]/g, "");
  return value;
}

export function formatRole(role: UserRole): string {
  switch (role) {
    case UserRole.STAFF:
      return "스태프";
    case UserRole.INGAME_ADMIN:
      return "인게임 관리자";
    case UserRole.MASTER:
      return "마스터";
    case UserRole.SUPERMASTER:
      return "슈퍼 마스터";
    default:
      return "알수없음";
  }
}
