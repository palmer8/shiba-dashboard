"use server";

import { boardService } from "@/service/board-service";
import { CategoryForm } from "@/components/dialog/add-category-dialog";
import { revalidatePath } from "next/cache";
import { JSONContent } from "novel";
import { Board, BoardComment, BoardCategory } from "@prisma/client";
import { LikeInfo } from "@/types/board";
import { ApiResponse } from "@/types/global.dto";

export async function createBoardAction(data: {
  title: string;
  content: JSONContent;
  categoryId: string;
  isNotice: boolean;
}): Promise<ApiResponse<Board>> {
  const result = await boardService.createBoard(data);
  if (result.success) {
    revalidatePath("/boards");
  }
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
  if (result.success) {
    revalidatePath(`/board/${data.id}`);
  }
  return result;
}

export async function deleteBoardAction(
  id: string
): Promise<ApiResponse<boolean>> {
  const result = await boardService.deleteBoard(id);
  if (result.success) {
    revalidatePath("/boards");
  }
  return result;
}

export async function createCommentAction(data: {
  boardId: string;
  content: string;
}): Promise<ApiResponse<BoardComment>> {
  const result = await boardService.createComment(data);
  if (result.success) {
    revalidatePath(`/board/[id]`, "layout");
  }
  return result;
}

export async function updateCommentAction(data: {
  commentId: string;
  content: string;
}): Promise<ApiResponse<BoardComment>> {
  const result = await boardService.updateComment(data);
  if (result.success) {
    revalidatePath("/board/[id]", "layout");
  }
  return result;
}

export async function deleteCommentAction(
  commentId: string
): Promise<ApiResponse<boolean>> {
  const result = await boardService.deleteComment(commentId);
  if (result.success) {
    revalidatePath("/board/[id]", "layout");
  }
  return result;
}

export async function createCategoryAction(
  data: CategoryForm
): Promise<ApiResponse<BoardCategory>> {
  const result = await boardService.createCategoryWithTemplate(data);
  if (result.success) {
    revalidatePath("/admin/board");
  }
  return result;
}

export async function updateCategoryAction(
  id: string,
  data: CategoryForm
): Promise<ApiResponse<BoardCategory>> {
  const result = await boardService.updateCategory(id, data);
  if (result.success) {
    revalidatePath("/admin/board");
  }
  return result;
}

export async function deleteCategoryAction(
  id: string
): Promise<ApiResponse<BoardCategory>> {
  const result = await boardService.deleteCategory(id);
  if (result.success) {
    revalidatePath("/admin/board");
  }
  return result;
}

export async function getCategoriesAction(): Promise<
  ApiResponse<BoardCategory[]>
> {
  return await boardService.getCategoryList();
}

export async function toggleBoardLikeAction(
  boardId: string
): Promise<ApiResponse<boolean>> {
  const result = await boardService.toggleBoardLike(boardId);
  if (result.success) {
    revalidatePath(`/board/${boardId}`);
  }
  return result;
}

export async function getBoardLikesAction(
  boardId: string
): Promise<ApiResponse<LikeInfo[]>> {
  return await boardService.getBoardLikes(boardId);
}
