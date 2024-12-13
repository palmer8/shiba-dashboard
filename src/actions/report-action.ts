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

export async function createIncidentReportAction(
  data: AddIncidentReportData
): Promise<ReportActionResponse> {
  try {
    const result = await reportService.createIncidentReport(data);
    revalidatePath("/block/report");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateIncidentReportAction(
  data: EditIncidentReportData
): Promise<ReportActionResponse> {
  try {
    const result = await reportService.updateIncidentReport(data);
    revalidatePath("/block/report");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteIncidentReportAction(
  reportId: number
): Promise<ReportActionResponse> {
  try {
    const result = await reportService.deleteIncidentReport(reportId);
    revalidatePath("/block/report");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createWhitelistAction(
  data: AddWhitelistData
): Promise<WhitelistActionResponse> {
  try {
    const result = await reportService.createWhitelist(data);
    revalidatePath("/block/ip");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteWhitelistAction(
  whitelistId: number
): Promise<WhitelistActionResponse> {
  try {
    const result = await reportService.deleteWhitelist(whitelistId);
    revalidatePath("/block/ip");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateWhitelistAction(
  data: EditWhitelistData
): Promise<WhitelistActionResponse> {
  try {
    const result = await reportService.updateWhitelist(data);
    revalidatePath("/block/ip");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteBlockTicketAction(
  ticketId: string
): Promise<BlockTicketActionResponse> {
  try {
    const result = await reportService.deleteBlockTicket(ticketId);
    revalidatePath("/block/report");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ... 기존 액션들 ...

export async function approveBlockTicketAction(
  ticketIds: string[]
): Promise<BlockTicketActionResponse> {
  try {
    const result = await reportService.approveBlockTicketByIds(ticketIds);
    revalidatePath("/block/report");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function approveAllBlockTicketAction(): Promise<BlockTicketActionResponse> {
  try {
    const result = await reportService.approveAllBlockTicket();
    revalidatePath("/block/report");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function rejectBlockTicketAction(
  ticketIds: string[]
): Promise<BlockTicketActionResponse> {
  try {
    const result = await reportService.rejectBlockTicketByIds(ticketIds);
    revalidatePath("/block/report");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function rejectAllBlockTicketAction(): Promise<BlockTicketActionResponse> {
  try {
    const result = await reportService.rejectAllBlockTicket();
    revalidatePath("/block/report");
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
