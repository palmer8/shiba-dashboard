import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import WhitelistFilter from "@/components/report/whitelist-filter";
import WhitelistTable from "@/components/report/whitelist-table";
import AddWhitelistDialog from "@/components/dialog/add-whitelist-dialog";
import { WhitelistFilters } from "@/types/report";
import { reportService } from "@/service/report-service";
import { GlobalTitle } from "@/components/global/global-title";

interface WhitelistPageProps {
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}

export default async function WhitelistPage({
  searchParams,
}: WhitelistPageProps) {
  const session = await auth();

  if (!session?.user) return redirect("/login");

  const params = await searchParams;

  const filter: WhitelistFilters = {
    page: params.page ? parseInt(params.page) : 1,
    user_ip: params.user_ip,
    comment: params.comment,
    registrant: params.registrant,
    date:
      params.fromDate && params.toDate
        ? [new Date(params.fromDate), new Date(params.toDate)]
        : undefined,
  };

  const whitelists = await reportService.getWhitelists(filter);

  return (
    <main>
      <PageBreadcrumb />
      <div className="flex justify-between items-center">
        <GlobalTitle
          title="IP 관리"
          description="IP를 입력하여 블랙리스트, 화이트리스트, 모니터링을 관리할 수 있습니다."
        />
        <AddWhitelistDialog />
      </div>
      <WhitelistFilter filter={filter} />
      <WhitelistTable
        data={{
          records: whitelists?.data?.records || [],
          total: whitelists?.data?.metadata.total || 0,
          page: whitelists?.data?.metadata.page || 1,
          totalPages: whitelists?.data?.metadata.totalPages || 1,
        }}
      />
    </main>
  );
}
