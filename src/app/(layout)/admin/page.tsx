import AdminManagementFilter from "@/components/admin/admin-management-filter";
import AdminManagementTable from "@/components/admin/admin-management-table";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { AdminDto } from "@/dto/admin.dto";
import { auth } from "@/lib/auth-config";
import { adminService } from "@/service/admin-service";
import { redirect } from "next/navigation";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  let data: AdminDto = {
    items: [],
    total: 0,
    page: 0,
    totalPages: 0,
  };
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

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
      <AdminManagementFilter filter={params} />
      <AdminManagementTable data={data} />
    </main>
  );
}
