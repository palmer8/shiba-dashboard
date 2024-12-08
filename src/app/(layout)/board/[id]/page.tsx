import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { boardService } from "@/service/board-service";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GlobalTitle } from "@/components/global/global-title";
import { Button } from "@/components/ui/button";
import { formatKoreanDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Editor from "@/components/editor/advanced-editor";
import { CommentSection } from "@/components/boards/comment-section";
import Link from "next/link";
import { ArrowLeft, Eye, MessageSquare, Pencil, Trash } from "lucide-react";
import { JSONContent } from "novel";
// import { DeleteBoardDialog } from "@/components/dialog/delete-board-dialog";

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

  const board = result.data;
  const isAuthor = session.user.id === board.registrant?.id;
  const isAdmin = session.user.role === "ADMIN";

  return (
    <main className="space-y-4">
      <PageBreadcrumb />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/boards" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              목록
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {board.isNotice && <Badge variant="secondary">공지</Badge>}
                <h2 className="text-2xl font-semibold">{board.title}</h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{board.registrant?.nickname}</span>
                <span>{formatKoreanDateTime(board.createdAt)}</span>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{board.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{board.comments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div className="p-6">
          <Editor
            initialValue={board.content as JSONContent}
            immediatelyRender={false}
            editable={false}
          />
        </div>
      </div>

      <CommentSection
        boardId={awaitParams.id}
        comments={board.comments}
        userId={session.user.id as string}
        userRole={session.user.role}
      />
    </main>
  );
}
