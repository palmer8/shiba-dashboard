import { BoardFilter } from "@/types/board";
import { BoardTable } from "@/components/boards/board-table";
import { BoardFilters } from "@/components/boards/board-filter";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GlobalTitle } from "@/components/global/global-title";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { boardService } from "@/service/board-service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";

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
  if (!session?.user) return redirect("/login");

  const params = await searchParams;
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
    <main className="space-y-4">
      <PageBreadcrumb />
      <div className="flex justify-between items-center">
        <GlobalTitle
          title="게시판"
          description="게시글을 작성하여 SHIBA 대시보드 이용자들과 소통하세요."
        />
        <Button asChild>
          <Link href="/board/write">글쓰기</Link>
        </Button>
      </div>
      <BoardFilters filters={filters} />
      <Suspense fallback={<TableSkeleton />}>
        <BoardContent filters={filters} page={page} />
      </Suspense>
    </main>
  );
}

async function BoardContent({
  filters,
  page,
}: {
  filters: BoardFilter;
  page: number;
}) {
  const result = await boardService.getBoardList(filters);

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
    />
  );
}
