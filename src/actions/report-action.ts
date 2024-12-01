"use server";

import {
  AddIncidentReportData,
  AddWhitelistData,
  EditIncidentReportData,
  EditWhitelistData,
} from "@/types/report";
import { reportService } from "@/service/report-service";
import { revalidatePath } from "next/cache";

export async function createIncidentReportAction(data: AddIncidentReportData) {
  const result = await reportService.createIncidentReport(data);
  revalidatePath("/block/report");
  return result;
}

export async function createWhitelistAction(data: AddWhitelistData) {
  const result = await reportService.createWhitelist(data);
  revalidatePath("/block/ip");
  return result;
}

export async function deleteIncidentReportAction(reportId: number) {
  const result = await reportService.deleteIncidentReport(reportId);
  revalidatePath("/block/report");
  return result;
}

export async function deleteWhitelistAction(whitelistId: number) {
  const result = await reportService.deleteWhitelist(whitelistId);
  revalidatePath("/block/ip");
  return result;
}

export async function updateIncidentReportAction(data: EditIncidentReportData) {
  const result = await reportService.updateIncidentReport(data);
  revalidatePath("/block/report");
  return result;
}

export async function updateWhitelistAction(data: EditWhitelistData) {
  const result = await reportService.updateWhitelist(data);
  revalidatePath("/block/ip");
  return result;
}
