"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatKoreanDateTime } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { Pencil, Trash, MessageSquare } from "lucide-react";
import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
} from "@/actions/board-action";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CommentData } from "@/types/board";

interface CommentSectionProps {
  boardId: string;
  comments: CommentData[];
  userId: string;
  userRole: UserRole;
}

export function CommentSection({
  boardId,
  comments,
  userId,
  userRole,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await createCommentAction({
        boardId,
        content: newComment.trim(),
      });

      if (result.success) {
        setNewComment("");
        toast({ title: "댓글이 작성되었습니다." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await updateCommentAction({
        commentId,
        content: editContent.trim(),
      });

      if (result.success) {
        setEditingId(null);
        toast({ title: "댓글이 수정되었습니다." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const result = await deleteCommentAction(commentId);
      if (result.success) {
        toast({ title: "댓글이 삭제되었습니다." });
      }
    } catch (error) {
      toast({
        title: "댓글 삭제 실패",
        description: "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (comment: CommentData) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const canModify = (commentUserId: string) => {
    return userId === commentUserId || userRole === UserRole.SUPERMASTER;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          댓글 {comments.length.toLocaleString()}
        </h3>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-lg border bg-card p-4 text-card-foreground"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1 w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {comment.registrant.nickname}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatKoreanDateTime(comment.createdAt)}
                  </span>
                </div>
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={() => handleUpdate(comment.id)}
                        disabled={isSubmitting}
                      >
                        수정
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{comment.content}</p>
                )}
              </div>
              {canModify(comment.registrant.id) && !editingId && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(comment)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수
                          없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(comment.id)}
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            댓글 작성
          </Button>
        </div>
      </div>
    </div>
  );
}
