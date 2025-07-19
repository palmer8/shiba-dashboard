import { CreditSearchFilter } from "@/components/credit/credit-search-filter";
import { CreditTable } from "@/components/credit/credit-table";
import { CreditTabs } from "@/components/credit/credit-tabs";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { creditService } from "@/service/credit-service";
import { CreditTableData } from "@/types/credit";
import { Status, UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: Status;
    startDate?: string;
    endDate?: string;
    approveStartDate?: string;
    approveEndDate?: string;
    userId?: string;
    type?: string;
    creditType?: string;
  }>;
}

export default async function GameCreditPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = (params.status as Status) || "PENDING";

  if (!hasAccess(session.user.role, UserRole.MASTER))
    return redirect("/404");

  const result = await creditService.getRewardRevokes(page, {
    status,
    startDate: params.startDate,
    endDate: params.endDate,
    approveStartDate: params.approveStartDate,
    approveEndDate: params.approveEndDate,
    userId: params.userId ? Number(params.userId) : undefined,
    type: params.type as any,
    creditType: params.creditType as any,
  });

  const tableData: CreditTableData = result.data ?? {
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
    type: params.type as any,
    creditType: params.creditType as any,
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="재화 지급/회수"
        description="SHIBA의 인게임 재화를 지급하거나 회수하는 티켓을 추가하고 관리할 수 있습니다."
      />
      <CreditSearchFilter filters={filterParams} />
      <CreditTabs />
      <CreditTable data={tableData} session={session} />
    </main>
  );
}
