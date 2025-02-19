import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { UserDataTable } from "@/components/game/user-data-table";
import { logService } from "@/service/log-service";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import UserLogFilter from "@/components/game/user-log-filter";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
    level?: string;
    startDate?: string;
    endDate?: string;
    message?: string;
  }>;
}

export default async function LogUserPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  const params = await searchParams;

  const filters = {
    page: Number(params.page) || 1,
    type: params.type,
    level: params.level,
    startDate: params.startDate,
    endDate: params.endDate,
    limit: 50,
    message: params.message || undefined,
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
      <UserLogFilter filter={filters} />
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
        session={session}
      />
    </main>
  );
}
