import { BoardFilter, BoardList } from "@/types/board";
import { Session } from "next-auth";
import { BoardTable } from "./board-table";
import { boardService } from "@/service/board-service";
import Empty from "@/components/ui/empty";

export async function BoardContent({
  filters,
  page,
  session,
  boards,
}: {
  filters: BoardFilter;
  page: number;
  session: Session;
  boards: BoardList;
}) {
  const result = await boardService.getBoardList(filters);

  if (!result.success) {
    return (
      <div className="text-center text-red-500">
        <Empty description="게시글 목록을 불러오는데 실패했습니다." />
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
