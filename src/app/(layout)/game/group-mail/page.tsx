import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GroupMailTable } from "@/components/mail/group-mail-table";
import { GroupMailSearchFilter } from "@/components/mail/group-mail-search-filter";
import { mailService } from "@/service/mail-service";
import { GroupMailTableData } from "@/types/mail";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
    userId?: string;
  }>;
}

export default async function GameGroupMailPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");
  if (!hasAccess(session.user.role, UserRole.MASTER)) return redirect("/404");

  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await mailService.getGroupMails(page, {
    startDate: params.startDate,
    endDate: params.endDate,
    reason: params.reason,
    userId: Number(params.userId) || undefined,
  });

  const tableData: GroupMailTableData = result.data ?? {
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
    reason: params.reason,
    userId: params.userId,
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="단체 우편"
        description="SHIBA의 단체 우편을 관리할 수 있습니다."
      />
      <GroupMailSearchFilter filters={filterParams} />
      <GroupMailTable data={tableData} />
    </main>
  );
}
