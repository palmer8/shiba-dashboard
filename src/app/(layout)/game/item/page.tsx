import { ItemQuantitySearchFilter } from "@/components/quantity/quantity-search-filter";
import { ItemQuantityTable } from "@/components/quantity/quantity-table";
import { ItemQuantityTabs } from "@/components/quantity/quantity-tabs";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { itemQuantityService } from "@/service/quantity-service";
import { ItemQuantityTableData } from "@/types/quantity";
import { Status } from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: Status;
    startDate?: string;
    endDate?: string;
    approveStartDate?: string;
    approveEndDate?: string;
    userId?: string;
  }>;
}

export default async function ItemQuantityPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = (params.status as Status) || "PENDING";

  const result = await itemQuantityService.getItemQuantities(page, {
    status,
    startDate: params.startDate,
    endDate: params.endDate,
    approveStartDate: params.approveStartDate,
    approveEndDate: params.approveEndDate,
    userId: params.userId ? Number(params.userId) : undefined,
  });

  const tableData: ItemQuantityTableData = result.data ?? {
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
    approveStartDate: params.approveStartDate,
    approveEndDate: params.approveEndDate,
    userId: params.userId ? Number(params.userId) : undefined,
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="아이템 지급/회수"
        description="SHIBA 이용자에게 아이템을 지급하거나 회수하는 티켓을 관리합니다."
      />
      <ItemQuantitySearchFilter filters={filterParams} />
      <ItemQuantityTabs />
      <ItemQuantityTable data={tableData} />
    </main>
  );
}
