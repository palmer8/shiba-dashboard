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

  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  const page = parseInt(params.page || "1");
  const filters: BoardFilter = {
    page,
    startDate: params.startDate,
    endDate: params.endDate,
    registrantId: params.registrantId,
    categoryId: params.categoryId,
    title: params.title,
  };

  const boards = await boardService.getBoardList(filters);

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
          {boards.error || !boards.data ? (
            <Empty description="게시글 목록을 불러오는데 실패했습니다." />
          ) : (
            <BoardContent
              session={session}
              filters={filters}
              page={page}
              boards={boards.data}
            />
          )}
        </Suspense>
      </div>
    </main>
  );
}
