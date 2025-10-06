"use client";

import { memo, useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Heart,
  MoreVertical,
  Pencil,
  Trash,
  MessageCircle,
  Edit,
  Download,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  toggleBoardLikeAction,
  getBoardLikesAction,
  deleteBoardAction,
} from "@/actions/board-action";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { BoardDetailView, LikeInfo } from "@/types/board";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  formatKoreanDateTime,
  hasAccess,
  checkPermission,
  convertNovelToMarkdown,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Editor from "@/components/editor/advanced-editor";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { JSONContent } from "novel";

interface BoardDetailProps {
  board: BoardDetailView;
  userId: string;
  userRole: UserRole;
}

export const BoardDetail = memo(function BoardDetail({
  board,
  userId,
  userRole,
}: BoardDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showLikes, setShowLikes] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isLiked, setIsLiked] = useState(board.isLiked);
  const [likeCount, setLikeCount] = useState(board._count.likes);
  const [isExporting, setIsExporting] = useState(false);

  const canModify =
    userId === board.registrant.id || userRole === UserRole.SUPERMASTER;
  const canExport = hasAccess(userRole, UserRole.MASTER);

  const handleLikeClick = useCallback(async () => {
    if (!session?.user) {
      toast({
        title: "로그인이 필요합니다",
        variant: "destructive",
      });
      return;
    }

    setIsLiked((prev) => !prev);
    setLikeCount((prev) => prev + (isLiked ? -1 : 1));

    const result = await toggleBoardLikeAction(board.id);
    if (!result.success) {
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => prev + (isLiked ? 1 : -1));

      toast({
        title: "좋아요 처리 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  }, [board.id, session?.user, isLiked]);

  const handleDelete = async () => {
    const result = await deleteBoardAction(board.id);
    if (result.success) {
      toast({ title: "게시글 삭제 성공" });
      router.replace("/boards");
    } else {
      toast({
        title: "게시글 삭제 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  const handleExportMarkdown = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const markdownContent = convertNovelToMarkdown(
        board.content as JSONContent
      );

      const blob = new Blob([markdownContent], {
        type: "text/markdown;charset=utf-8;",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const fileName = `${
        board.title.replace(/[/\?%*:|"<>]/g, "-") || "게시글"
      }.md`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast({ title: "Markdown 파일 내보내기 성공" });
    } catch (error) {
      console.error("Markdown export error:", error);
      toast({
        title: "Markdown 파일 내보내기 실패",
        description: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [board.content, board.title, isExporting]);

  return (
    <>
      <div className="w-full mx-auto min-h-[calc(100vh-300px)] flex flex-col">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="p-1">
            <div className="flex items-center justify-between">
              <Link
                href="/boards"
                prefetch={false}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/boards");
                  router.refresh();
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                목록
              </Link>
              <div className="flex items-center gap-2">
                {canModify && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLikes(true)}
                      disabled={isExporting}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isLiked ? "fill-current text-red-500" : ""
                        }`}
                      />
                      <span className="ml-1">{likeCount}</span>
                    </Button>
                    <Link href={`/board/${board.id}/edit`}>
                      <Button variant="ghost" size="sm" disabled={isExporting}>
                        <Pencil className="h-4 w-4 mr-1" />
                        수정
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteAlert(true)}
                      disabled={isExporting}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </>
                )}
                {canExport && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportMarkdown}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        내보내는 중...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-1" />
                        내보내기(MD)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="p-1 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {board.isNotice && <Badge variant="secondary">공지</Badge>}
                  <Badge variant="outline">{board.category.name}</Badge>
                </div>
                <h1 className="text-2xl font-semibold">{board.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={board.registrant?.image || ""} />
                      <AvatarFallback>
                        {board.registrant?.nickname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{board.registrant?.nickname}</span>
                  </div>
                  <span>{formatKoreanDateTime(board.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{board.views.toLocaleString()}</span>
                  </div>
                  {!canModify && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0"
                      onClick={handleLikeClick}
                      disabled={isExporting}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isLiked ? "fill-current text-red-500" : ""
                        }`}
                      />
                      <span className="ml-1">{likeCount}</span>
                    </Button>
                  )}
                </div>
              </div>
              <Separator />
              <Editor
                initialValue={board.content}
                immediatelyRender={false}
                editable={false}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showLikes} onOpenChange={setShowLikes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>좋아요 ({board._count.likes})</DialogTitle>
            <DialogDescription>
              좋아요를 누른 대시보드 이용자들입니다.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {board.likes.map((like) => (
                <div
                  key={like.id}
                  className="p-3 flex items-center justify-between border-b last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="font-medium">
                      {like.nickname} ({like.userId})
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatKoreanDateTime(like.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
