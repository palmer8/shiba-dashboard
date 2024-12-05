import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { PersonalMailTable } from "@/components/mail/personal-mail-table";
import { PersonalMailSearchFilter } from "@/components/mail/personal-mail-search-filter";
import { mailService } from "@/service/mail-service";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
    registrantUserId?: string;
    userId?: string;
  }>;
}

export default async function GamePersonalMailPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const filterParams = {
    startDate: params.startDate,
    endDate: params.endDate,
    reason: params.reason,
    registrantUserId: params.registrantUserId
      ? parseInt(params.registrantUserId)
      : undefined,
    userId: params.userId ? parseInt(params.userId) : undefined,
  };

  const tableData = await mailService.getPersonalMails(page, filterParams);

  return (
    <main className="space-y-4">
      <PageBreadcrumb />
      <GlobalTitle
        title="개인 우편"
        description="SHIBA의 개인 우편을 관리할 수 있습니다."
      />
      <PersonalMailSearchFilter filters={filterParams} />
      <PersonalMailTable data={tableData.data!} />
    </main>
  );
}
