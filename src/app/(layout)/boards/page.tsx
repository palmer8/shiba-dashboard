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

  const filters: BoardFilter = {
    startDate: params.startDate,
    endDate: params.endDate,
    registrantId: params.registrantId,
    title: params.title,
    categoryId: params.categoryId,
  };

  const page = Number(params.page) || 1;
  const result = await boardService.getBoardList({
    page,
    ...filters,
  });

  // 기본값 제공
  const defaultBoardList = {
    boards: [],
    notices: [],
    metadata: {
      currentPage: page,
      totalPages: 1,
      totalCount: 0,
    },
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
      <BoardTable
        data={result.success && result.data ? result.data.boards : []}
        notices={result.success && result.data ? result.data.notices : []}
        metadata={
          result.success && result.data
            ? result.data.metadata
            : defaultBoardList.metadata
        }
        page={page}
      />
    </main>
  );
}
