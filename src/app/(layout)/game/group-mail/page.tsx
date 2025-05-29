import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GroupMailTable } from "@/components/mail/group-mail-table";
import { GroupMailSearchFilter } from "@/components/mail/group-mail-search-filter";
import { getGroupMailReserves } from "@/service/mail-service";
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
    title?: string;
  }>;
}

export default async function GameGroupMailPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");
  if (!hasAccess(session.user.role, UserRole.STAFF)) return redirect("/404");

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) - 1 : 0; // 0-based 페이징

  const result = await getGroupMailReserves(page, {
    startDate: params.startDate,
    endDate: params.endDate,
    title: params.title,
  });

  // GroupMailReserveList를 GroupMailTableData 형태로 변환
  const tableData: GroupMailTableData = {
    records: result.reserves.map(reserve => ({
      id: reserve.id.toString(),
      reason: reserve.title, // title을 reason으로 매핑
      content: reserve.content,
      rewards: Object.entries(reserve.rewards).map(([itemId, amount]) => ({
        type: "ITEM" as const,
        itemId,
        itemName: itemId, // 아이템 이름은 아이템 ID와 동일하게 처리
        amount: amount.toString(),
      })),
      startDate: reserve.start_time,
      endDate: reserve.end_time,
      registrantId: null,
      createdAt: reserve.start_time, // start_time을 createdAt으로 사용
      updatedAt: reserve.start_time, // start_time을 updatedAt으로 사용
    })),
    metadata: {
      total: result.metadata.totalCount,
      page: result.metadata.currentPage + 1, // 1-based로 변환
      totalPages: result.metadata.totalPages,
    },
  };

  const filterParams = {
    startDate: params.startDate,
    endDate: params.endDate,
    title: params.title,
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="단체 우편"
        description="SHIBA의 단체 우편을 관리할 수 있습니다."
      />
      <GroupMailSearchFilter filters={filterParams} />
      <GroupMailTable data={tableData} session={session} />
    </main>
  );
}
