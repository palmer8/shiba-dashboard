import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import IncidentReportFilter from "@/components/report/incident-report-filter";
import IncidentReportTable from "@/components/report/incident-report-table";
import AddIncidentReportDialog from "@/components/dialog/add-incident-report-dialog";
import { PenaltyType, ReportFilters } from "@/types/report";
import { reportService } from "@/service/report-service";
import { GlobalTitle } from "@/components/global/global-title";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Suspense } from "react";
import { Session } from "next-auth";

// 최신 데이터를 항상 가져오기 위해 캐싱 비활성화
export const dynamic = 'force-dynamic';

interface ReportPageProps {
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

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

  return (
    <main>
      <PageBreadcrumb />
      <div className="flex justify-between items-center">
        <GlobalTitle
          title="사건 처리 보고서"
          description="사건 처리 보고서를 작성하고 관리할 수 있습니다."
        />
        <AddIncidentReportDialog session={session} />
      </div>
      <IncidentReportFilter filter={filter} />
      <Suspense fallback={<TableSkeleton />}>
        <ReportContent filter={filter} session={session} />
      </Suspense>
    </main>
  );
}

async function ReportContent({
  filter,
  session,
}: {
  filter: ReportFilters;
  session: Session;
}) {
  const reports = await reportService.getIncidentReports(filter);

  const initialData = {
    records: [],
    total: 0,
    page: filter.page || 1,
    totalPages: 1,
  };

  const tableData =
    reports?.success && reports.data ? reports.data : initialData;

  return <IncidentReportTable data={tableData} session={session} />;
}
