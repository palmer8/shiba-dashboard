import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { PersonalMailTable } from "@/components/mail/personal-mail-table";
import { PersonalMailSearchFilter } from "@/components/mail/personal-mail-search-filter";
import { PersonalMailTabs } from "@/components/mail/personal-mail-tabs";
import { getPersonalMails } from "@/service/mail-service";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    used?: string;
  }>;
}

export default async function GamePersonalMailPage({
  searchParams,
}: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");
  if (!hasAccess(session.user.role, UserRole.STAFF)) return redirect("/404");

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) - 1 : 0; // 0-based 페이징
  const used = params.used === "0" ? false : true; // 기본값은 사용됨(true), "1"이거나 undefined일 때 true

  const filterParams = {
    startDate: params.startDate,
    endDate: params.endDate,
    userId: params.userId ? parseInt(params.userId) : undefined,
    used,
  };

  const tableData = await getPersonalMails(page, filterParams);

  // PersonalMailList를 PersonalMailTableData 형태로 변환
  const transformedData = {
    records: tableData.mails,
    metadata: {
      total: tableData.metadata.totalCount,
      page: tableData.metadata.currentPage + 1, // 1-based로 변환
      totalPages: tableData.metadata.totalPages,
    },
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="개인 우편"
        description="SHIBA의 개인 우편을 관리할 수 있습니다."
      />
      <PersonalMailSearchFilter filters={filterParams} />
      <PersonalMailTabs />
      <PersonalMailTable data={transformedData} session={session} />
    </main>
  );
}
