import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { boardService } from "@/service/board-service";
import { BoardDetail } from "@/components/boards/board-detail";
import { CommentSection } from "@/components/boards/comment-section";
import { BoardDetailView } from "@/types/board";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const session = await auth();
  const awaitParams = await params;
  if (!session?.user) return redirect("/login");

  const result = await boardService.getBoardById(awaitParams.id);
  if (!result.success || !result.data) {
    redirect("/boards");
  }

  const board = result.data as BoardDetailView;

  return (
    <main className="space-y-4 max-w-[900px] mx-auto">
      <BoardDetail
        board={board}
        userId={session.user.id as string}
        userRole={session.user.role}
      />
      <CommentSection
        boardId={awaitParams.id}
        comments={board.comments}
        userId={session.user.id as string}
        userRole={session.user.role}
      />
    </main>
  );
}
