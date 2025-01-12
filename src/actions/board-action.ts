"use server";

import { boardService } from "@/service/board-service";
import { revalidatePath } from "next/cache";
import { JSONContent } from "novel";
import { Board, BoardComment, BoardCategory } from "@prisma/client";
import { BoardDetailView, CommentData, LikeInfo } from "@/types/board";
import { ApiResponse } from "@/types/global.dto";
import { cache } from "react";
import { BoardList, BoardFilter } from "@/types/board";
import { CategoryForm, EditCategoryForm } from "@/lib/validations/board";

// 게시글 목록 캐싱
const getCachedBoardList = cache(async (filters: BoardFilter) => {
  return boardService.getBoardList(filters);
});

// 카테고리 목록 캐싱
const getCachedCategories = cache(async () => {
  return boardService.getCategoryListByUsedAndRole();
});

// 게시글 상세 정보 캐싱
const getCachedBoardDetail = cache(async (id: string) => {
  return boardService.getBoardDetail(id);
});

// 댓글 목록 캐싱
const getCachedComments = cache(async (boardId: string) => {
  return boardService.getComments(boardId);
});

export async function createBoardAction(data: {
  title: string;
  content: JSONContent;
  categoryId: string;
  isNotice: boolean;
}): Promise<ApiResponse<Board>> {
  const result = await boardService.createBoard(data);
  if (result.success) revalidatePath("/boards");

  return result;
}

export async function updateBoardAction(data: {
  id: string;
  title: string;
  content: JSONContent;
  categoryId: string;
  isNotice: boolean;
}): Promise<ApiResponse<Board>> {
  const result = await boardService.updateBoard(data);
  if (result.success) revalidatePath(`/board/${data.id}`);
  return result;
}

export async function deleteBoardAction(
  id: string
): Promise<ApiResponse<boolean>> {
  const result = await boardService.deleteBoard(id);
  if (result.success) revalidatePath("/boards");
  return result;
}

export async function createCommentAction(data: {
  boardId: string;
  content: string;
}): Promise<ApiResponse<CommentData>> {
  const result = await boardService.createComment(data);
  if (result.success) revalidatePath(`/board/${data.boardId}`);
  return result;
}

export async function updateCommentAction(data: {
  commentId: string;
  content: string;
}): Promise<ApiResponse<BoardComment>> {
  const result = await boardService.updateComment(data);
  if (result.success) revalidatePath("/board/[id]");
  return result;
}

export async function deleteCommentAction(
  commentId: string
): Promise<ApiResponse<boolean>> {
  const result = await boardService.deleteComment(commentId);
  if (result.success) revalidatePath("/board/[id]", "layout");
  return result;
}

export async function createCategoryAction(
  data: CategoryForm
): Promise<ApiResponse<BoardCategory>> {
  const result = await boardService.createCategoryWithTemplate(data);
  if (result.success) revalidatePath("/admin/board");
  return result;
}

export async function updateCategoryAction(
  id: string,
  data: EditCategoryForm
): Promise<ApiResponse<BoardCategory>> {
  const result = await boardService.updateCategory(id, data);
  if (result.success) revalidatePath("/admin/board");
  return result;
}

export async function deleteCategoryAction(
  id: string
): Promise<ApiResponse<BoardCategory>> {
  const result = await boardService.deleteCategory(id);
  if (result.success) revalidatePath("/admin/board");
  return result;
}

export async function getCategoriesAction(): Promise<
  ApiResponse<BoardCategory[]>
> {
  return getCachedCategories();
}

export async function toggleBoardLikeAction(
  boardId: string
): Promise<ApiResponse<boolean>> {
  const result = await boardService.toggleBoardLike(boardId);
  return result;
}

export async function getBoardLikesAction(
  boardId: string
): Promise<ApiResponse<LikeInfo[]>> {
  return await boardService.getBoardLikes(boardId);
}

export async function getBoardListsByIdsOriginAction(
  ids: string[]
): Promise<ApiResponse<Board[]>> {
  return await boardService.getBoardListsByIdsOrigin(ids);
}

export async function getCategoryListByIdsOriginAction(
  ids: string[]
): Promise<ApiResponse<BoardCategory[]>> {
  return await boardService.getCategoryListByIdsOrigin(ids);
}

export async function getBoardListAction(
  filters: BoardFilter
): Promise<ApiResponse<BoardList>> {
  return getCachedBoardList(filters);
}

export async function getBoardDetailAction(
  id: string
): Promise<ApiResponse<BoardDetailView>> {
  return getCachedBoardDetail(id);
}
