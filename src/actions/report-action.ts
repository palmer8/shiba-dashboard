"use server";

import {
  AddIncidentReportData,
  AddWhitelistData,
  BlockTicketActionResponse,
  EditIncidentReportData,
  EditWhitelistData,
  ReportActionResponse,
  WhitelistActionResponse,
} from "@/types/report";
import { reportService } from "@/service/report-service";
import { revalidatePath } from "next/cache";
import { ApiResponse } from "@/types/global.dto";
import { BlockTicket } from "@prisma/client";

export async function createIncidentReportAction(
  data: AddIncidentReportData
): Promise<ReportActionResponse> {
  const result = await reportService.createIncidentReport(data);
  if (result.success) revalidatePath("/block/report");
  return result;
}

export async function updateIncidentReportAction(
  data: EditIncidentReportData
): Promise<ReportActionResponse> {
  try {
    const result = await reportService.updateIncidentReport(data);
    if (result.success) {
      revalidatePath("/block/report");
      revalidatePath("/admin/report"); // BlockTicket 관련 페이지도 리밸리데이션
    }
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

export async function deleteIncidentReportAction(
  reportId: number
): Promise<ReportActionResponse> {
  const result = await reportService.deleteIncidentReport(reportId);
  if (result.success) revalidatePath("/block/report");
  return result;
}

export async function createWhitelistAction(
  data: AddWhitelistData
): Promise<WhitelistActionResponse> {
  const result = await reportService.createWhitelist(data);
  if (result.success) revalidatePath("/block/ip");
  return result;
}

export async function deleteWhitelistAction(
  whitelistId: number
): Promise<WhitelistActionResponse> {
  const result = await reportService.deleteWhitelist(whitelistId);
  if (result.success) revalidatePath("/block/ip");
  return result;
}

export async function updateWhitelistAction(
  data: EditWhitelistData
): Promise<WhitelistActionResponse> {
  const result = await reportService.updateWhitelist(data);
  if (result.success) revalidatePath("/block/ip");
  return result;
}

export async function deleteBlockTicketAction(
  ticketId: string
): Promise<BlockTicketActionResponse> {
  const result = await reportService.deleteBlockTicket(ticketId);
  if (result.success) revalidatePath("/block/ip");
  return result;
}

export async function approveBlockTicketAction(
  ticketIds: string[]
): Promise<BlockTicketActionResponse> {
  const result = await reportService.approveBlockTicketByIds(ticketIds);
  if (result.success) revalidatePath("/admin/report");
  return result;
}

export async function approveAllBlockTicketAction(): Promise<BlockTicketActionResponse> {
  const result = await reportService.approveAllBlockTicket();
  if (result.success) revalidatePath("/admin/report");
  return result;
}

export async function rejectBlockTicketAction(
  ticketIds: string[]
): Promise<BlockTicketActionResponse> {
  const result = await reportService.rejectBlockTicketByIds(ticketIds);
  if (result.success) revalidatePath("/admin/report");
  return result;
}

export async function rejectAllBlockTicketAction(): Promise<BlockTicketActionResponse> {
  const result = await reportService.rejectAllBlockTicket();
  if (result.success) revalidatePath("/admin/report");
  return result;
}

export async function getBlockTicketByIdsOriginAction(
  ids: string[]
): Promise<ApiResponse<BlockTicket[]>> {
  const result = await reportService.getBlockTicketByIdsOrigin(ids);
  return result;
}

export async function getPendingBlockTicketsCountAction(): Promise<
  ApiResponse<number>
> {
  const result = await reportService.getPendingBlockTicketsCount();
  return result;
}

export async function getPendingBlockTicketsWithReportsAction(): Promise<
  ApiResponse<any[]>
> {
  const result = await reportService.getPendingBlockTicketsWithReports();
  return result;
}
