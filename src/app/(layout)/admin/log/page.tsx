import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { AdminLogFilters } from "@/types/log";
import { logService } from "@/service/log-service";
import AdminLogFilter from "@/components/admin/admin-log-filter";
import AdminLogTable from "@/components/admin/admin-log-table";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GlobalTitle } from "@/components/global/global-title";

export default async function AdminLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) return redirect("/login");

  const params = await searchParams;

  const filter: AdminLogFilters = {
    page: params.page ? parseInt(params.page) : 1,
    content: params.content,
    registrantUserId: params.registrantUserId
      ? parseInt(params.registrantUserId)
      : undefined,
    date:
      params.fromDate && params.toDate
        ? [new Date(params.fromDate), new Date(params.toDate)]
        : undefined,
  };

  const logs = await logService.getAdminLogs(filter);

  return (
    <main className="space-y-4">
      <PageBreadcrumb />
      <GlobalTitle
        title="운영툴 조회 로그"
        description="대시보드 이용자의 액션들의 대한 모든 로그를 조회할 수 있습니다."
      />
      <AdminLogFilter filter={filter} />
      <AdminLogTable
        data={logs?.data || { records: [], total: 0, page: 1, totalPages: 1 }}
      />
    </main>
  );
}
