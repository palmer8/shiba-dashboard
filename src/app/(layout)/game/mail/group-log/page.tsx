import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { getGroupMailReserveLogs } from "@/service/mail-service";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { GroupMailLogSearchFilter } from "@/components/mail/group-mail-log-search-filter";
import { GroupMailLogTable } from "@/components/mail/group-mail-log-table";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
    reserveId?: string;
    userId?: string;
  }>;
}

export default async function GameGroupMailLogPage({
  searchParams,
}: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");
  if (!hasAccess(session.user.role, UserRole.STAFF)) return redirect("/404");

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1; // 1-based 페이징

  const filterParams = {
    startDate: params.startDate,
    endDate: params.endDate,
    reserveId: params.reserveId ? parseInt(params.reserveId) : undefined,
    userId: params.userId ? parseInt(params.userId) : undefined,
  };

  const tableData = await getGroupMailReserveLogs(page, filterParams);

  // GroupMailReserveLogList를 GroupMailLogTableData 형태로 변환
  const transformedData = {
    records: tableData.logs,
    metadata: {
      total: tableData.metadata.total,
      page: tableData.metadata.page,
      totalPages: tableData.metadata.totalPages,
    },
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="단체 우편 수령 로그"
        description="SHIBA의 단체 우편 수령 로그를 조회할 수 있습니다."
      />
      <GroupMailLogSearchFilter filters={filterParams} />
      <GroupMailLogTable data={transformedData} session={session} />
    </main>
  );
} 