"use client";

import { useState, useMemo } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [currentPage, setCurrentPage] = useState(1);
  const COMMENTS_PER_PAGE = 10;

  const paginatedComments = useMemo(() => {
    const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
    return comments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);
  }, [comments, currentPage]);

  const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE);

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
        toast({ title: "댓글 작성 완료" });
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
        toast({ title: "댓글 수정 완료" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const result = await deleteCommentAction(commentId);
      if (result.success) {
        toast({ title: "댓글 삭제 완료" });
      }
    } catch (error) {
      toast({
        title: "댓글 삭제 실패",
        description: "잠시 후 다시 시도해주세요",
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <h3 className="font-medium">댓글 {comments.length}</h3>
        </div>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            댓글 작성
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {paginatedComments.map((comment) => (
          <div key={comment.id} className="py-3 border-b last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={comment.registrant.image || ""} />
                    <AvatarFallback>
                      {comment.registrant.nickname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {comment.registrant.nickname}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatKoreanDateTime(comment.createdAt)}
                  </span>
                </div>
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] text-sm resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(comment.id)}
                      >
                        수정
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
              {canModify(comment.registrant.id) && !editingId && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEditing(comment)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash className="h-3.5 w-3.5" />
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              className="w-8 h-8"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
