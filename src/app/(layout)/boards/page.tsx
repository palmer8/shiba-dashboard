import { Suspense } from "react";
import { BoardFilter } from "@/types/board";
import { BoardTable } from "@/components/boards/board-table";
import { BoardFilters } from "@/components/boards/board-filter";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GlobalTitle } from "@/components/global/global-title";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { getBoardListAction } from "@/actions/board-action";
import BoardTableSkeleton from "@/components/boards/board-table-skeleton";
import { Session } from "next-auth";

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
  const params = await searchParams;

  if (!session?.user) return redirect("/login");
  if (!session.user.isPermissive) return redirect("/pending");

  const page = parseInt(params.page || "1");
  const filters: BoardFilter = {
    page,
    startDate: params.startDate,
    endDate: params.endDate,
    registrantId: params.registrantId,
    categoryId: params.categoryId,
    title: params.title,
  };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="게시판"
        description="게시글을 작성하여 SHIBA 대시보드 이용자들과 소통하세요."
      />
      <div className="space-y-4">
        <BoardFilters filters={filters} />
        <Suspense fallback={<BoardTableSkeleton />}>
          <BoardContent session={session} filters={filters} page={page} />
        </Suspense>
      </div>
    </main>
  );
}

async function BoardContent({
  filters,
  page,
  session,
}: {
  filters: BoardFilter;
  page: number;
  session: Session;
}) {
  const result = await getBoardListAction(filters);

  if (!result.success) {
    return (
      <div className="text-center text-red-500">
        {result.error || "게시글 목록을 불러오는데 실패했습니다."}
      </div>
    );
  }

  return (
    <BoardTable
      data={result.data?.boards || []}
      notices={result.data?.notices || []}
      metadata={
        result.data?.metadata || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
        }
      }
      page={page}
      session={session}
    />
  );
}
