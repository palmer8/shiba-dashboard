import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { boardService } from "@/service/board-service";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { BoardDetail } from "@/components/boards/board-detail";
import { CommentSection } from "@/components/boards/comment-section";

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
    return redirect("/boards");
  }

  return (
    <main className="space-y-4 max-w-[900px] mx-auto">
      <BoardDetail
        board={result.data}
        userId={session.user.id as string}
        userRole={session.user.role}
      />
      <CommentSection
        boardId={awaitParams.id}
        comments={result.data.comments}
        userId={session.user.id as string}
        userRole={session.user.role}
      />
    </main>
  );
}
