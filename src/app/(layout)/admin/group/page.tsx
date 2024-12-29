import { AdminGroupFilter } from "@/components/admin/admin-group-filter";
import { AdminGroupTable } from "@/components/admin/admin-group-table";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { adminService } from "@/service/admin-service";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    name?: string;
    role?: UserRole;
  }>;
}

export default async function AdminGroupPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (!session.user.isPermissive) return redirect("/pending");

  // 슈퍼마스터만 접근 가능
  if (session.user.role !== UserRole.SUPERMASTER) {
    return redirect("/unauthorized");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await adminService.getGroups(page, {
    name: params.name,
    role: params.role,
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
    name: params.name,
    role: params.role,
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="그룹 관리"
        description="대시보드 권한에 따른 그룹 접근 여부를 설정합니다."
      />
      <AdminGroupFilter filters={filterParams} />
      <AdminGroupTable data={tableData} session={session} />
    </main>
  );
}
