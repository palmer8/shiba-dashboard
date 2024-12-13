import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "@prisma/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Parser } from "json2csv";
import { GameDataType } from "@/types/game";
import { JSONContent } from "novel";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateCouponCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let couponCode = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters[randomIndex];
  }
  return couponCode;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
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

export function formatKoreanNumber(num: number) {
  const units = ["", "만", "억", "조", "경", "해"];
  const digits = String(num).split("").reverse();
  const chunks: number[] = [];

  // 4자리씩 나누기
  for (let i = 0; i < digits.length; i += 4) {
    chunks.push(
      Number(
        digits
          .slice(i, i + 4)
          .reverse()
          .join("")
      )
    );
  }

  const result = chunks
    .map((chunk, i) => {
      if (chunk === 0) return "";
      return `${chunk}${units[i]}`;
    })
    .reverse()
    .filter(Boolean)
    .join(" ");

  return result || "0";
}

export function formatGameDataType(type: string): string {
  const types: Record<string, string> = {
    item: "아이템",
    CREDIT: "골드 박스",
    CREDIT2: "프리미엄 박스",
    WALLET: "현금",
    BANK: "계좌",
    mileage: "마일리지",
    registration: "차량번호",
    CURRENT_CASH: "보유 캐시",
    ACCUMULATED_CASH: "누적 캐시",
  };
  return types[type] || type;
}

export function formatAmount(amount: number, type: GameDataType): string {
  if (type === "REGISTRATION") return amount.toString();
  if (
    ["BANK", "WALLET", "MILEAGE", "CURRENT_CASH", "ACCUMULATED_CASH"].includes(
      type
    )
  ) {
    return `${amount.toLocaleString()}원`;
  }
  return `${amount.toLocaleString()}개`;
}

export function downloadCSV(data: any[], filename: string) {
  const headers = ["ID", "닉네임", "가입일", "조회 유형", "조회 결과"];
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.id,
        row.nickname,
        row.first_join,
        formatGameDataType(row.type),
        row.amount,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export function sanitizeContent(content: JSONContent) {
  return JSON.parse(
    JSON.stringify(content, (key, value) => {
      if (value && typeof value === "object" && value.type === "image") {
        return {
          type: "image",
          attrs: {
            src: value.attrs?.src || "",
            alt: value.attrs?.alt || "",
            title: value.attrs?.title || "",
            width: value.attrs?.width,
            height: value.attrs?.height,
          },
        };
      }
      return value;
    })
  );
}

export function hasEditPermission(
  userId: string,
  authorId: string,
  userRole: UserRole
) {
  return userId === authorId || userRole === "SUPERMASTER";
}

export function checkPermission(
  userId: string | undefined,
  authorId: string,
  userRole?: UserRole
) {
  if (!userId) return false;
  if (!userRole) return userId === authorId;
  return userId === authorId || userRole === "SUPERMASTER";
}
