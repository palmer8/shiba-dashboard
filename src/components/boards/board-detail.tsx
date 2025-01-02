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
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { Button } from "../ui/button";
import { formatKoreanDateTime } from "@/lib/utils";
import { Badge } from "../ui/badge";
import Editor from "../editor/advanced-editor";
import { Separator } from "../ui/separator";

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

  const canModify =
    userId === board.registrant.id || userRole === UserRole.SUPERMASTER;

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

  return (
    <>
      <div className="max-w-[900px] w-full mx-auto">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/boards" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                목록
              </Link>
            </div>
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/board/${board.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      수정
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteAlert(true)}>
                    <Trash className="mr-2 h-4 w-4" />
                    삭제
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLikes(true)}>
                    <Heart className="mr-2 h-4 w-4" />
                    좋아요 확인
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="mt-4">
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleLikeClick}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isLiked ? "fill-current text-red-500" : ""
                    }`}
                  />
                  <span>{likeCount}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div className="max-w-[900px] mx-auto p-4">
          <Editor
            initialValue={board.content}
            immediatelyRender={false}
            editable={false}
          />
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
              {board.likes.map((user) => (
                <div
                  key={user.id}
                  className="p-3 flex items-center justify-between border-b last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="font-medium">
                      {user.nickname} ({user.userId})
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatKoreanDateTime(user.createdAt)}
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
