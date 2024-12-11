"use server";

import { boardService } from "@/service/board-service";
import { CategoryForm } from "@/components/dialog/add-category-dialog";
import { revalidatePath } from "next/cache";
import { JSONContent } from "novel";
import { GlobalReturn } from "@/types/global-return";
import { Board, BoardComment, BoardCategory } from "@prisma/client";
import { LikeInfo } from "@/types/board";

// 게시글 생성
export async function createBoardAction(data: {
  title: string;
  content: JSONContent;
  categoryId: string;
  isNotice: boolean;
}): Promise<GlobalReturn<Board>> {
  const result = await boardService.createBoard(data);
  if (result.success) {
    revalidatePath("/boards");
  }
  return result;
}

// 게시글 수정
export async function updateBoardAction(data: {
  id: string;
  title: string;
  content: JSONContent;
  categoryId: string;
  isNotice: boolean;
}): Promise<GlobalReturn<Board>> {
  const result = await boardService.updateBoard(data);
  if (result.success) {
    revalidatePath(`/board/${data.id}`);
  }
  return result;
}

// 게시글 삭제
export async function deleteBoardAction(
  id: string
): Promise<GlobalReturn<boolean>> {
  const result = await boardService.deleteBoard(id);
  if (result.success) {
    revalidatePath("/boards");
  }
  return result;
}

// 댓글 생성
export async function createCommentAction(data: {
  boardId: string;
  content: string;
}): Promise<GlobalReturn<BoardComment>> {
  const result = await boardService.createComment(data);
  if (result.success) {
    revalidatePath(`/board/[id]`, "layout");
  }
  return result;
}

// 댓글 수정
export async function updateCommentAction(data: {
  commentId: string;
  content: string;
}): Promise<
  GlobalReturn<BoardComment & { registrant: { id: string; nickname: string } }>
> {
  const result = await boardService.updateComment(data);
  if (result.success) {
    revalidatePath("/board/[id]", "layout");
  }
  return result;
}

// 댓글 삭제
export async function deleteCommentAction(
  commentId: string
): Promise<GlobalReturn<boolean>> {
  const result = await boardService.deleteComment(commentId);
  if (result.success) {
    // 댓글이 속한 게시글의 경로를 revalidate
    revalidatePath("/board/[id]", "layout");
  }
  return result;
}

// 카테고리 생성
export async function createCategoryAction(
  data: CategoryForm
): Promise<GlobalReturn<BoardCategory>> {
  const result = await boardService.createCategoryWithTemplate(data);
  if (result.success) {
    revalidatePath("/admin/board");
  }
  return result;
}

// 카테고리 수정
export async function updateCategoryAction(
  id: string,
  data: CategoryForm
): Promise<GlobalReturn<BoardCategory>> {
  const result = await boardService.updateCategory(id, data);
  if (result.success) {
    revalidatePath("/admin/board");
  }
  return result;
}

// 카테고리 삭제
export async function deleteCategoryAction(
  id: string
): Promise<GlobalReturn<BoardCategory>> {
  const result = await boardService.deleteCategory(id);
  if (result.success) {
    revalidatePath("/admin/board");
  }
  return result;
}

// 카테고리 목록 조회
export async function getCategoriesAction(): Promise<
  GlobalReturn<BoardCategory[]>
> {
  return await boardService.getCategoryList();
}

// 좋아요 토글
export async function toggleBoardLikeAction(
  boardId: string
): Promise<GlobalReturn<boolean>> {
  const result = await boardService.toggleBoardLike(boardId);
  if (result.success) {
    revalidatePath(`/board/${boardId}`);
  }
  return result;
}

// 좋아요 목록 조회
export async function getBoardLikesAction(
  boardId: string
): Promise<GlobalReturn<LikeInfo[]>> {
  return await boardService.getBoardLikes(boardId);
}
