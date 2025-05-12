import BanFilter from "@/components/game/ban-filter";
import BanTable from "@/components/game/ban-table";
import { getBanListAction } from "@/actions/ban-action";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GlobalTitle } from "@/components/global/global-title";

interface BanPageProps {
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}

export default async function BanPage({ searchParams }: BanPageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");

  const params = await searchParams;

  const filter = {
    page: params.page ? parseInt(params.page) : 1,
    user_id: params.user_id,
    name: params.name,
    banreason: params.banreason,
    fromDate: params.fromDate,
    toDate: params.toDate,
  };

  const result = await getBanListAction(filter);
  const initialData = {
    records: [],
    metadata: { total: 0, page: filter.page || 1, totalPages: 1 },
  };
  const tableData = result?.success && result.data ? result.data : initialData;

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="하드밴 관리"
        description="하드밴 데이터를 조회 및 관리할 수 있습니다."
      />
      <BanFilter filter={filter} />
      <BanTable data={tableData} />
    </main>
  );
}
