// import AdminManagementFilter from "@/components/admin/admin-management-filter";
import AdminManagementTable from "@/components/admin/admin-management-table";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { adminService } from "@/service/admin-service";
import { AdminDto } from "@/types/user";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");
  if (!hasAccess(session.user.role, UserRole.MASTER)) return redirect("/404");

  const params = await searchParams;

  let data: AdminDto = {
    items: [],
    page: 0,
    totalPages: 0,
    totalCount: 0,
  };

  const result = await adminService.getDashboardUsers(params);
  if (result.success && result.data) {
    data = result.data;
  }

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="어드민 관리"
        description="대시보드 사용자들을 관리할 수 있습니다."
      />
      {/* <AdminManagementFilter filter={params} /> */}
      <AdminManagementTable data={data} session={session} />
    </main>
  );
}
