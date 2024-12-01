import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "@prisma/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Parser } from "json2csv";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  STAFF: 0,
  INGAME_ADMIN: 1,
  MASTER: 2,
  SUPERMASTER: 3,
};

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

export function hasAccess(userRole: UserRole, requiredRole: UserRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function parseCustomDateString(dateStr: string): Date {
  const [time, date] = dateStr.split(" ");
  const [hours, minutes, seconds] = time.split(":");
  const [day, month, year] = date.split("/");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds)
  );
}

export function parseTimeString(timeStr: string): Date {
  const [time, date] = timeStr.split(" ");
  const [hours, minutes, seconds] = time.split(":");
  const [day, month, year] = date.split("/");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds)
  );
}

export function formatKoreanDateTime(date: Date): string {
  return format(date, "yyyy-MM-dd HH:mm:ss", { locale: ko });
}

export function handleDownloadJson2CSV({
  data,
  fileName,
}: {
  data: unknown[];
  fileName: string;
}) {
  const parser = new Parser();
  const csv = parser.parse(data);

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${formatKoreanDateTime(new Date())}_${fileName}.csv`;
  a.click();
}
