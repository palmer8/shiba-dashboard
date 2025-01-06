import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "@prisma/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Parser } from "json2csv";
import { GameDataType } from "@/types/game";
import { JSONContent } from "novel";
import { parse } from "csv-parse/sync";
import { MarkdownNode } from "@/types/lib";
import JSZip from "jszip";

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
  try {
    return format(date, "yyyy-MM-dd HH:mm:ss", { locale: ko });
  } catch (error) {
    return date?.toString() || "-";
  }
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
    ITEM_CODE: "아이템 코드",
    ITEM_NAME: "아이템 이름",
    NICKNAME: "닉네임",
    INSTAGRAM: "인스타그램",
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
  const headers = ["ID", "네임", "가입일", "조회 유형", "조회 결과"];
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

export function parsePersonalMailCSV(fileContent: string) {
  try {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // 빈 행 필터링 및 필수 필드 검증
    const validRecords = records
      .filter(
        (record: any) =>
          record.reason?.trim() && record.content?.trim() && record.userId
      )
      .map((record: any) => {
        try {
          return {
            reason: record.reason.trim(),
            content: record.content.trim(),
            rewards: JSON.parse(record.rewards || "[]"),
            needItems: JSON.parse(record.needItems || "[]"),
            userId: parseInt(record.userId),
          };
        } catch (e) {
          console.error("레코드 파싱 에러:", e);
          return null;
        }
      })
      .filter((record: any) => record !== null);

    if (validRecords.length === 0) {
      throw new Error("유효한 데이터가 없습니다.");
    }

    return validRecords;
  } catch (error) {
    console.error("CSV 파싱 에러:", error);
    throw new Error("CSV 파일 형식이 올바르지 않습니다.");
  }
}

export function cleanupContent(
  content: JSONContent | JSONContent[]
): JSONContent | JSONContent[] {
  if (Array.isArray(content)) {
    return content
      .filter((node) => {
        if (node.type === "text") {
          return node.text && node.text.trim() !== "";
        }
        return true;
      })
      .map((node) => cleanupContent(node) as JSONContent);
  }

  const node = { ...content };

  // content 속성이 있는 경우 재귀적으로 정리
  if (node.content) {
    node.content = node.content
      .filter((child: JSONContent) => {
        if (child.type === "text") {
          return child.text && child.text.trim() !== "";
        }
        return true;
      })
      .map((child: JSONContent) => cleanupContent(child) as JSONContent);

    // 빈 content 배열 처리
    if (node.content.length === 0) {
      delete node.content;
    }
  }

  // text 노드의 경우 공백 처리
  if (node.type === "text" && (!node.text || node.text.trim() === "")) {
    return null as any;
  }

  return node;
}

export function convertMarkdownToNovel(nodes: MarkdownNode[]): JSONContent[] {
  const converted = nodes
    .map((node): JSONContent => {
      switch (node.type) {
        case "heading":
          return {
            type: "heading",
            attrs: { level: node.depth || 1 },
            content: node.children
              ? convertMarkdownToNovel(node.children)
              : undefined,
          };

        case "list":
          return {
            type: node.ordered ? "orderedList" : "bulletList",
            content: node.children
              ? convertMarkdownToNovel(node.children)
              : undefined,
          };

        case "listItem":
          return {
            type: "listItem",
            content: node.children
              ? convertMarkdownToNovel(node.children)
              : undefined,
          };

        case "paragraph":
          return {
            type: "paragraph",
            content: node.children
              ? convertMarkdownToNovel(node.children)
              : undefined,
          };

        case "link":
          return {
            type: "text",
            marks: [
              {
                type: "link",
                attrs: {
                  href: node.url || "",
                  title: node.title || "",
                },
              },
            ],
            text: node.children?.[0]?.value || node.value || "",
          };

        case "image":
          return {
            type: "image",
            attrs: {
              src: node.url || "",
              alt: node.alt || "",
              title: node.title || "",
            },
          };

        case "strong":
          return {
            type: "text",
            marks: [{ type: "bold" }],
            text: node.children?.[0]?.value || node.value || "",
          };

        case "emphasis":
          return {
            type: "text",
            marks: [{ type: "italic" }],
            text: node.children?.[0]?.value || node.value || "",
          };

        case "code":
          return {
            type: "text",
            marks: [{ type: "code" }],
            text: node.value || "",
          };

        case "blockquote":
          return {
            type: "blockquote",
            content: node.children
              ? convertMarkdownToNovel(node.children)
              : undefined,
          };

        case "thematicBreak":
          return {
            type: "horizontalRule",
          };

        case "text":
          // 빈 텍스트 노드 처리
          if (!node.value?.trim()) {
            return null as any;
          }
          const textNode: JSONContent = {
            type: "text",
            text: node.value,
          };

          // marks가 있는 경우에만 추가
          if (node.marks && node.marks.length > 0) {
            textNode.marks = node.marks;
          }

          return textNode;

        default:
          // 알 수 없는 노드 타입은 일반 텍스트로 변환
          return {
            type: "text",
            text: node.value || "",
          };
      }
    })
    .filter(Boolean); // null 값 제거

  // 변환된 결과를 cleanup
  return cleanupContent(converted) as JSONContent[];
}

export async function handleDonwloadJSZip(fileName: string, ...args: any[]) {
  // const zip = new JSZip();
  // zip.file(fileName, JSON.stringify(data));
  // const content = await zip.generateAsync({ type: "blob" });
  // saveAs(content, fileName);
}

// 시간 문자열 검증
export function isValidTimeString(time: string | null | undefined): boolean {
  if (!time) return false;
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

// 안전한 시간 계산 함수
export function calculateWorkHours(
  startTime: string | null | undefined,
  endTime: string | null | undefined
): number {
  if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) return 0;

  const [startHours, startMinutes] = startTime!.split(":").map(Number);
  const [endHours, endMinutes] = endTime!.split(":").map(Number);

  let hours = endHours - startHours;
  let minutes = endMinutes - startMinutes;

  // 날짜를 넘어가는 경우 처리
  if (hours < 0 || (hours === 0 && minutes < 0)) {
    hours += 24;
  }

  return hours + minutes / 60;
}

// 시간 포맷팅 함수
export function formatWorkHours(hours: number): string {
  if (isNaN(hours) || hours < 0) return "0시간";
  return `${hours.toFixed(1)}시간`;
}

// 시간 위치 계산 (캘린더용)
export function getTimePosition(time: string | null): number {
  if (!isValidTimeString(time)) return 0;
  const [hours, minutes] = time!.split(":").map(Number);
  return hours * 2.5 + (minutes / 60) * 2.5;
}

// 시간 간격 계산 (캘린더용)
export function getTimeDuration(
  start: string | null,
  end: string | null
): number {
  if (!isValidTimeString(start) || !isValidTimeString(end)) return 0;

  const startPos = getTimePosition(start);
  const endPos = getTimePosition(end);

  let duration = endPos - startPos;
  if (duration < 0) {
    duration += 24 * 2.5; // 날짜를 넘어가는 경우
  }

  return duration;
}

// 근무 시간 표시 텍스트 생성
export function getWorkTimeText(
  startTime: string | null,
  endTime: string | null,
  isOvernight: boolean = false
): string {
  if (!isValidTimeString(startTime)) return "-";
  if (!isValidTimeString(endTime)) return `${startTime} ~`;

  const text = `${startTime} ~ ${endTime}`;
  return isOvernight ? `${text} (익일)` : text;
}

export function extractTextFromJSON(json: JSONContent): string {
  let text = "";

  if (json.content) {
    json.content.forEach((node) => {
      if (node.type === "text" && node.text) {
        text += node.text + " ";
      } else if (node.content) {
        text += extractTextFromJSON(node) + " ";
      }
    });
  }

  return text.trim();
}

export async function handleDownloadMultipleJson2CSV(
  files: {
    data: any;
    fileName: string;
  }[]
) {
  const zip = new JSZip();
  const parser = new Parser();

  // 각 파일을 CSV로 변환하고 ZIP에 추가
  files.forEach((file) => {
    const csv = parser.parse(file.data);
    const csvContent = "\ufeff" + csv; // UTF-8 BOM 추가
    zip.file(
      `${formatKoreanDateTime(new Date())}_${file.fileName}.csv`,
      csvContent
    );
  });

  // ZIP 파일 생성 및 다운로드
  const content = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = `${formatKoreanDateTime(new Date())}_export.zip`;
  a.click();
}

export const getFirstNonEmojiCharacter = (text?: string | null): string => {
  if (!text) return "";

  // 이모지를 제외한 첫 번째 문자를 찾음
  const nonEmojiMatch = text.match(/[A-Za-z0-9가-힣]/);
  if (nonEmojiMatch) {
    return nonEmojiMatch[0].toUpperCase();
  }

  // 이모지나 일반 문자가 없는 경우
  return "?";
};

// 동일하거나 상위 권한인지 확인하는 함수
export function isSameOrHigherRole(
  userRole: UserRole,
  targetRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] <= ROLE_HIERARCHY[targetRole];
}
