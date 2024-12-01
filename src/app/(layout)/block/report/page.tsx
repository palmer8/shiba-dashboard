import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import IncidentReportFilter from "@/components/report/incident-report-filter";
import IncidentReportTable from "@/components/report/incident-report-table";
import AddIncidentReportDialog from "@/components/dialog/add-incident-report-dialog";
import { PenaltyType, ReportFilters } from "@/types/report";
import { reportService } from "@/service/report-service";
import { GlobalTitle } from "@/components/global/global-title";

interface ReportPageProps {
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const session = await auth();

  if (!session?.user) return redirect("/login");

  const params = await searchParams;

  const filter: ReportFilters = {
    page: params.page ? parseInt(params.page) : 1,
    penalty_type: params.penalty_type as PenaltyType,
    reason: params.reason,
    target_user_id: params.target_user_id,
    reporting_user_id: params.reporting_user_id,
    admin: params.admin,
    incident_time:
      params.fromDate && params.toDate
        ? [new Date(params.fromDate), new Date(params.toDate)]
        : undefined,
  };

  const reports = await reportService.getIncidentReports(filter);

  return (
    <main className="space-y-4">
      <PageBreadcrumb />
      <div className="flex justify-between items-center">
        <GlobalTitle
          title="사건 처리 보고서"
          description="사건 처리 보고서를 작성하고 관리할 수 있습니다."
        />
        <AddIncidentReportDialog />
      </div>
      <IncidentReportFilter filter={filter} />
      <IncidentReportTable
        data={
          reports?.data || { records: [], total: 0, page: 1, totalPages: 1 }
        }
      />
    </main>
  );
}
