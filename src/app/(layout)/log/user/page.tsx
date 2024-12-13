import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { UserDataTable } from "@/components/game/user-data-table";
import { logService } from "@/service/log-service";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
    level?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function LogUserPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) return redirect("/login");

  const params = await searchParams;

  const filters = {
    page: Number(params.page) || 1,
    type: params.type,
    level: params.level,
    resource: params.resource,
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate) : undefined,
    limit: 50,
  };

  const result = await logService.getGameLogs(filters);

  const defaultLogList = {
    records: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="유저 로그"
        description="실시간으로 SHIBA의 유저 로그를 확인할 수 있습니다."
      />
      <UserDataTable
        data={result.success ? result.data?.records || [] : []}
        metadata={{
          currentPage: result.success ? result.data?.page || 1 : 1,
          totalPages: result.success
            ? result.data?.totalPages || 1
            : defaultLogList.totalPages,
          totalCount: result.success
            ? result.data?.total || 0
            : defaultLogList.total,
        }}
        page={filters.page}
      />
    </main>
  );
}
