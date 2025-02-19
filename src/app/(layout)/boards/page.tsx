import { Suspense } from "react";
import { BoardFilter } from "@/types/board";
import { BoardFilters } from "@/components/boards/board-filter";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GlobalTitle } from "@/components/global/global-title";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import BoardTableSkeleton from "@/components/boards/board-table-skeleton";
import { BoardContent } from "@/components/boards/board-content";
import { boardService } from "@/service/board-service";
import Empty from "@/components/ui/empty";
import { BoardTable } from "@/components/boards/board-table";

export const dynamic = "force-dynamic";
export const revalidate = 30;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
    registrantId?: string;
    categoryId?: string;
    title?: string;
  }>;
}

export default async function BoardsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  const params = await searchParams;
  const page = Number(params.page) || 0; // 0-based pagination으로 변경

  const filters: BoardFilter = {
    page,
    startDate: params.startDate,
    endDate: params.endDate,
    registrantId: params.registrantId,
    categoryId: params.categoryId,
    title: params.title,
  };

  const result = await boardService.getBoardList(filters);

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="게시판"
        description="게시글을 작성하여 SHIBA 대시보드 이용자들과 소통하세요."
      />
      <div className="space-y-4">
        <BoardFilters filters={filters} />
        <BoardTable
          data={result.data?.boards || []}
          notices={result.data?.notices || []}
          metadata={
            result.data?.metadata || {
              currentPage: 0,
              totalPages: 0,
              totalCount: 0,
            }
          }
          page={page}
        />
      </div>
    </main>
  );
}
