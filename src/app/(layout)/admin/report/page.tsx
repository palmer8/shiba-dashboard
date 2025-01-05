import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { BlockTicketFilter } from "@/components/report/block-ticket-filter";
import { BlockTicketTable } from "@/components/report/block-ticket-table";
import { BlockTicketTabs } from "@/components/report/block-ticket-tabs";
import { Status, UserRole } from "@prisma/client";
import { reportService } from "@/service/report-service";
import { GlobalTitle } from "@/components/global/global-title";
import { hasAccess } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}

export default async function BlockTicketPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  const params = await searchParams;

  const page = Number(params.page) || 1;
  const status = (params.status as Status) || "PENDING";

  const result = await reportService.getBlockTickets(page, {
    status,
    startDate: params.startDate,
    endDate: params.endDate,
    approveStartDate: params.approveStartDate,
    approveEndDate: params.approveEndDate,
    userId: params.userId ? Number(params.userId) : undefined,
  });

  const tableData = result.data ?? {
    records: [],
    metadata: {
      total: 0,
      page: 1,
      totalPages: 1,
    },
  };

  const filterParams = {
    startDate: params.startDate,
    endDate: params.endDate,
    approveStartDate: params.approveStartDate,
    approveEndDate: params.approveEndDate,
    userId: params.userId ? Number(params.userId) : undefined,
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="사건처리 보고 승인"
        description="스태프의 사건처리 보고서의 영구정지 티켓을 관리합니다."
      />

      <BlockTicketFilter filters={filterParams} />
      <BlockTicketTabs />
      <BlockTicketTable session={session} data={tableData} />
    </main>
  );
}
