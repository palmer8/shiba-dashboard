import { WHITELIST_STATUS } from "@/constant/constant";
import { z } from "zod";

export const whitelistSchema = z.object({
  user_ip: z.string().refine(
    (value) => {
      const ips = value.split("\n").filter((ip) => ip.trim() !== "");
      return ips.every((ip) =>
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|\*)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|\*)$/.test(
          ip.trim()
        )
      );
    },
    {
      message:
        "올바른 IP 형식이 아닙니다. (예: 111.111.111.111 또는 111.111.*.*)",
    }
  ),
  comment: z.string().min(1, "설명을 입력해주세요").optional(),
  status: z.enum(Object.keys(WHITELIST_STATUS) as [string, ...string[]]),
});

export type WhitelistForm = z.infer<typeof whitelistSchema>;

export const editWhitelistSchema = z.object({
  id: z.number(),
  user_ip: z
    .string()
    .refine(
      (value) =>
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|\*)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|\*)$/.test(
          value
        ),
      {
        message:
          "올바른 IP 형식이 아닙니다. (예: 111.111.111.111 또는 111.111.*.*)",
      }
    ),
  comment: z.string().min(1, "설명을 입력해주세요").optional(),
  status: z.enum(Object.keys(WHITELIST_STATUS) as [string, ...string[]]),
});

export type EditWhitelistForm = z.infer<typeof editWhitelistSchema>;

export const incidentReportBaseSchema = z.object({
  reason: z.string().min(1, "사유를 입력해주세요"),
  incidentDescription: z.string().min(5, "상세 내용을 5자 이상 입력해주세요"),
  incidentTime: z.date(),
  targetUserId: z.coerce.number().min(1, "대상자 ID를 입력해주세요"),
  targetUserNickname: z.string().min(1, "대상자 닉네임을 입력해주세요"),
  reportingUserId: z.coerce.number().nullable(),
  reportingUserNickname: z.string().nullable(),
  penaltyType: z.enum(["구두경고", "경고", "게임정지", "정지해제"] as const),
  warningCount: z.coerce.number().nullable(),
  detentionTimeMinutes: z.coerce.number().nullable(),
  banDurationHours: z.coerce.number().nullable(),
  image: z.string().nullable(),
});

export const addIncidentReportSchema = incidentReportBaseSchema;
export const editIncidentReportSchema = incidentReportBaseSchema.extend({
  reportId: z.number(),
});

export type IncidentReportFormData = z.infer<typeof incidentReportBaseSchema>;
export type EditIncidentReportFormData = z.infer<
  typeof editIncidentReportSchema
>;
