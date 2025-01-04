import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { StaffLogFilters } from "@/components/game/staff-log-filter";
import { StaffLogTable } from "@/components/game/staff-log-table";
import { auth } from "@/lib/auth-config";
import { logService } from "@/service/log-service";
import { StaffLogFilter } from "@/types/log";
import { redirect } from "next/navigation";

export default async function StaffLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (!session.user.isPermissive) return redirect("/pending");

  const params = await searchParams;

  const filters: StaffLogFilter = {
    page: params.page ? Number(params.page) : 1,
    staffId: params.staffId as string,
    targetId: params.targetId as string,
    startDate: params.startDate as string,
    endDate: params.endDate as string,
  };

  const result = await logService.getStaffLogs(filters);
  const data = result.success
    ? result.data
    : {
        records: [],
        total: 0,
        page: 1,
        totalPages: 1,
        pageSize: 50,
      };

  return (
    <main className="space-y-4">
      <PageBreadcrumb />
      <GlobalTitle
        title="스태프 로그"
        description="스태프들의 활동 내역을 조회할 수 있습니다."
      />
      <StaffLogFilters filters={filters} />
      <StaffLogTable
        data={
          data || {
            records: [],
            total: 0,
            page: 1,
            totalPages: 1,
            pageSize: 50,
          }
        }
      />
    </main>
  );
}
