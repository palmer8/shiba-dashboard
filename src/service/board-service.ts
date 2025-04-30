import prisma from "@/db/prisma";
import {
  Prisma,
  UserRole,
  Board,
  BoardComment,
  BoardCategory,
} from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { JSONContent } from "novel";
import { redirect } from "next/navigation";
import {
  BoardList,
  BoardDetailView,
  CommentData,
  BoardFilter,
  RecentBoards,
  LikeInfo,
  BoardData,
} from "@/types/board";
import { ApiResponse } from "@/types/global.dto";
import { CategoryForm } from "@/lib/validations/board";
import { logService } from "@/service/log-service";

// 공통으로 사용되는 게시글 조회 옵션
const commonBoardSelect = {
  id: true,
  title: true,
  createdAt: true,
  isNotice: true,
  category: {
    select: {
      id: true,
      name: true,
      roles: true,
    },
  },
  registrant: {
    select: {
      id: true,
      nickname: true,
      image: true,
      role: true,
    },
  },
  _count: {
    select: {
      comments: true,
      likes: true,
    },
  },
} as const;

// 서버 측에서 최근 조회 기록을 저장할 객체
// key: `${userId}-${boardId}`, value: timestamp
const viewRecords: Record<string, number> = {};

// 조회수 관련 유틸리티 함수
function canIncrementView(userId: string, boardId: string): boolean {
  const key = `${userId}-${boardId}`;
  const now = Date.now();
  const lastViewTime = viewRecords[key] || 0;

  // 5분(300,000ms) 이내에 같은 사용자가 같은 게시글을 조회한 경우
  if (now - lastViewTime < 5 * 60 * 1000) {
    return false;
  }

  // 조회 시간 업데이트
  viewRecords[key] = now;

  // 메모리 관리를 위해 1시간 이상 된 기록은 삭제
  const oneHourAgo = now - 60 * 60 * 1000;
  Object.keys(viewRecords).forEach((k) => {
    if (viewRecords[k] < oneHourAgo) {
      delete viewRecords[k];
    }
  });

  return true;
}

class BoardService {
  // 게시글 생성
  async createBoard(data: {
    title: string;
    content: JSONContent;
    categoryId: string;
    isNotice: boolean;
  }): Promise<ApiResponse<Board>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      if (data.isNotice && session.user.role !== "SUPERMASTER") {
        return {
          success: false,
          error: "공지사항 작성 권한이 없습니다.",
          data: null,
        };
      }

      if (data.title.length < 5 || data.title.length > 30) {
        return {
          success: false,
          error: "제목은 5자 이상 30자 이하로 입력해주세요.",
          data: null,
        };
      }

      const board = await prisma.board.create({
        data: {
          title: data.title,
          content: data.content,
          categoryId: data.categoryId,
          registrantId: session.user.id as string,
          isNotice: data.isNotice,
        },
        include: {
          registrant: {
            select: { id: true, nickname: true },
          },
          category: {
            select: { id: true, name: true },
          },
        },
      });

      await logService.writeAdminLog(
        `게시글 작성: ${this.truncateText(data.title)}`
      );

      return {
        success: true,
        error: null,
        data: {
          ...board,
          content: data.content,
        },
      };
    } catch (error) {
      console.error("Create board error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "게시글 작성에 실패했습니다.",
      };
    }
  }

  // 게시글 수정
  async updateBoard(data: {
    id: string;
    title: string;
    content: JSONContent;
    categoryId: string;
    isNotice: boolean;
  }): Promise<ApiResponse<Board>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const board = await prisma.board.findUnique({
        where: { id: data.id },
        select: { registrantId: true },
      });

      if (!board) {
        return {
          success: false,
          error: "게시글을 찾을 수 없습니다.",
          data: null,
        };
      }

      if (session.user.role !== UserRole.SUPERMASTER) {
        if (board.registrantId !== session.user.id) {
          return {
            success: false,
            error: "수정 권한이 없습니다.",
            data: null,
          };
        }
      }

      const updatedBoard = await prisma.board.update({
        where: { id: data.id },
        data: {
          title: data.title,
          content: data.content as any,
          categoryId: data.categoryId,
          isNotice: data.isNotice,
        },
        include: {
          registrant: {
            select: { id: true, nickname: true, image: true },
          },
          category: {
            select: { id: true, name: true },
          },
        },
      });

      await logService.writeAdminLog(
        `게시글 수정: ${this.truncateText(data.title)}`
      );

      return {
        success: true,
        error: null,
        data: {
          ...updatedBoard,
          content: updatedBoard.content as unknown as JSONContent,
        },
      };
    } catch (error) {
      console.error("Update board error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "게시글 수정에 실패했습니다.",
      };
    }
  }

  // 게시글 삭제
  async deleteBoard(id: string): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const board = await prisma.board.findUnique({
        where: { id },
        select: { registrantId: true, title: true },
      });

      if (!board) {
        return {
          success: false,
          error: "게시글을 찾을 수 없습니다.",
          data: null,
        };
      }

      if (board.registrantId !== session.user.id) {
        return {
          success: false,
          error: "삭제 권한이 없습니다.",
          data: null,
        };
      }

      await prisma.board.delete({
        where: { id },
      });

      await logService.writeAdminLog(
        `${this.truncateText(board.title)} 게시글 삭제`
      );

      return {
        success: true,
        error: null,
        data: true,
      };
    } catch (error) {
      console.error("Delete board error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "게시글 삭제에 실패했습니다.",
      };
    }
  }

  // 댓글 생성
  async createComment(data: {
    boardId: string;
    content: string;
  }): Promise<ApiResponse<CommentData>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const comment = await prisma.boardComment.create({
        data: {
          content: data.content,
          boardId: data.boardId,
          registrantId: session.user.id as string,
        },
        include: {
          registrant: {
            select: {
              id: true,
              nickname: true,
              image: true,
              role: true,
            },
          },
        },
      });

      const transformedComment: CommentData = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        registrant: {
          ...comment.registrant,
          role: comment.registrant.role,
        },
      };

      await logService.writeAdminLog(
        `댓글 작성: ${this.truncateText(data.content)}`
      );

      return {
        success: true,
        data: transformedComment,
        error: null,
      };
    } catch (error) {
      console.error("Create comment error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "댓글 작성에 실패했습니다.",
      };
    }
  }

  async updateComment(data: {
    commentId: string;
    content: string;
  }): Promise<ApiResponse<BoardComment>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const comment = await prisma.boardComment.update({
        where: { id: data.commentId },
        data: { content: data.content },
        include: {
          registrant: {
            select: {
              id: true,
              nickname: true,
              image: true,
            },
          },
        },
      });

      await logService.writeAdminLog(
        `댓글 수정: ${this.truncateText(data.content)}`
      );

      return {
        success: true,
        error: null,
        data: comment,
      };
    } catch (error) {
      console.error("Update comment error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "댓글 수정에 실패했습니다.",
      };
    }
  }

  // 댓글 삭제
  async deleteComment(commentId: string): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const comment = await prisma.boardComment.findUnique({
        where: { id: commentId },
        select: { registrantId: true, content: true },
      });

      if (!comment) {
        return {
          success: false,
          error: "댓글을 찾을 수 없습니다.",
          data: null,
        };
      }

      if (comment.registrantId !== session.user.id) {
        return {
          success: false,
          error: "삭제 권한이 없습니다.",
          data: null,
        };
      }

      await prisma.boardComment.delete({
        where: { id: commentId },
      });

      await logService.writeAdminLog(
        `댓글 삭제: ${this.truncateText(comment.content)}`
      );

      return {
        success: true,
        error: null,
        data: true,
      };
    } catch (error) {
      console.error("Delete comment error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.",
      };
    }
  }

  async getBoardDetail(id: string): Promise<ApiResponse<BoardDetailView>> {
    const session = await auth();
    if (!session || !session.user) return redirect("/login");

    try {
      const board = await prisma.board.findFirst({
        where: {
          id,
          ...(session.user.role !== UserRole.SUPERMASTER && {
            category: {
              OR: [{ role: session.user.role }, { role: null }],
            },
          }),
        },
        include: {
          registrant: {
            select: { id: true, nickname: true, image: true, role: true },
          },
          category: {
            select: {
              id: true,
              name: true,
              roles: true,
            },
          },
          comments: {
            include: {
              registrant: {
                select: { id: true, nickname: true, image: true, role: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          likes: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                  role: true,
                  image: true,
                  userId: true,
                },
              },
              createdAt: true,
            },
          },
        },
      });

      if (!board) {
        return {
          success: false,
          error: "게시글을 찾을 수 없거나 접근 권한이 없습니다.",
          data: null,
        };
      }

      if (
        session.user.role !== UserRole.SUPERMASTER &&
        !board.category?.roles?.includes(session.user.role) &&
        board.category?.roles?.length !== 0
      ) {
        return { success: false, error: "접근 권한이 없습니다.", data: null };
      }

      const transformedData: BoardDetailView = {
        id: board.id,
        title: board.title,
        content: board.content as JSONContent,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        views: board.views,
        isNotice: board.isNotice,
        registrant: board.registrant,
        category: board.category || {
          id: "",
          name: "정보없음",
          roles: [],
        },
        comments: board.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          registrant: comment.registrant,
        })),
        isLiked: board.likes.some((like) => like.user.id === session.user!.id),
        likes: board.likes.map((like) => ({
          id: like.user.id,
          nickname: like.user.nickname,
          userId: like.user.userId.toString(),
          createdAt: like.createdAt,
        })),
        _count: {
          likes: board.likes.length,
          comments: board.comments.length,
        },
      };

      return {
        success: true,
        data: transformedData,
        error: null,
      };
    } catch (error) {
      console.error("Get board error:", error);
      return {
        success: false,
        error: "게시글 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 조회수만 증가시키는 함수
  async incrementViewCount(id: string): Promise<void> {
    const session = await auth();
    if (!session?.user) return;

    const userId = session.user.id;
    // userId가 undefined인 경우 처리
    if (!userId) return;

    // 조회수 증가 여부 확인
    if (!canIncrementView(userId, id)) {
      return; // 5분 이내에 다시 조회했다면 조회수 증가하지 않음
    }

    // 조회수 증가 로직
    await prisma.board.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async getBoardList(filters: BoardFilter): Promise<ApiResponse<BoardList>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const itemsPerPage = 20;
      const skip = (filters.page || 0) * itemsPerPage;

      // 1. 공통 where 조건을 미리 구성하여 재사용
      const baseWhereCondition: Prisma.BoardWhereInput = {
        ...(session.user.role !== UserRole.SUPERMASTER && {
          category: {
            roles: { has: session.user.role },
          },
        }),
        ...(filters.startDate &&
          filters.endDate && {
            createdAt: {
              gte: this.getDateWithoutTime(filters.startDate),
              lte: new Date(
                this.getDateWithoutTime(filters.endDate).setHours(
                  23,
                  59,
                  59,
                  999
                )
              ),
            },
          }),
        ...(filters.title && {
          title: { contains: filters.title },
        }),
        ...(filters.categoryId &&
          filters.categoryId !== "ALL" && {
            categoryId: filters.categoryId,
          }),
        ...(filters.registrantId && {
          registrantId: filters.registrantId,
        }),
      };

      // 2. 공통으로 사용되는 include 옵션을 상수로 분리
      const commonInclude = {
        registrant: {
          select: {
            id: true,
            nickname: true,
            image: true,
            role: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            roles: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      } as const;

      // 3. Promise.all을 사용하여 병렬 처리
      const [notices, totalCount, boards] = await Promise.all([
        prisma.board.findMany({
          where: {
            ...baseWhereCondition,
            isNotice: true,
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: commonInclude,
        }),
        prisma.board.count({
          where: {
            ...baseWhereCondition,
            isNotice: false,
          },
        }),
        prisma.board.findMany({
          where: {
            ...baseWhereCondition,
            isNotice: false,
          },
          skip,
          take: itemsPerPage,
          orderBy: { createdAt: "desc" },
          include: commonInclude,
        }),
      ]);

      // 4. 메타데이터 계산을 최적화
      const totalPages = Math.ceil(totalCount / itemsPerPage);
      const currentPage = filters.page || 0;

      return {
        success: true,
        error: null,
        data: {
          notices: notices as BoardData[],
          boards: boards as BoardData[],
          metadata: {
            totalCount,
            totalPages,
            currentPage,
          },
        },
      };
    } catch (error) {
      console.error("Get board list error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "게시글 목록 조회에 실패했습니다.",
        data: null,
      };
    }
  }

  // 카테고리 생성
  async createCategoryWithTemplate(
    data: CategoryForm
  ): Promise<ApiResponse<BoardCategory>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        error: "권한이 없습니다.",
        data: null,
      };
    }

    try {
      const category = await prisma.boardCategory.create({
        data: {
          name: data.name,
          role: null,
          roles: data.roles,
          template: data.template,
          isUsed: data.isUsed,
          registrantId: session.user.id,
        },
      });

      return {
        error: null,
        success: true,
        data: category,
      };
    } catch (error) {
      console.error("Create category error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 생성에 실패했습니다.",
      };
    }
  }

  // 카테고리 수정
  async updateCategory(
    id: string,
    data: CategoryForm
  ): Promise<ApiResponse<BoardCategory>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        error: "권한이 없습니다.",
        data: null,
      };
    }

    try {
      const category = await prisma.boardCategory.update({
        where: { id },
        data: {
          name: data.name,
          template: data.template,
          isUsed: data.isUsed,
          role: null,
          roles: data.roles,
        },
      });

      return {
        error: null,
        success: true,
        data: category,
      };
    } catch (error) {
      console.error("Update category error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 수정에 실패했습니다.",
      };
    }
  }

  // 카테고리 삭제
  async deleteCategory(id: string): Promise<ApiResponse<BoardCategory>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        error: "권한이 없습니다.",
        data: null,
      };
    }

    try {
      const category = await prisma.boardCategory.delete({
        where: { id },
      });

      return {
        error: null,
        success: true,
        data: category,
      };
    } catch (error) {
      console.error("Delete category error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 삭제에 실패했습니다.",
      };
    }
  }

  async getCategoryListByUsedAndRole(): Promise<ApiResponse<BoardCategory[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const categories = await prisma.boardCategory.findMany({
        where: {
          isUsed: true,
          ...(session.user.role !== UserRole.SUPERMASTER && {
            OR: [
              { roles: { has: session.user.role } },
              { roles: { isEmpty: true } },
            ],
          }),
        },
        include: {
          registrant: {
            select: {
              id: true,
              nickname: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        error: null,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 목록 조회에 실패했습니다.",
      };
    }
  }

  // 카테고리 상세 조회
  async getCategoryById(id: string): Promise<ApiResponse<BoardCategory>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const category = await prisma.boardCategory.findUnique({
        where: { id },
        include: {
          registrant: {
            select: {
              id: true,
              nickname: true,
              image: true,
            },
          },
        },
      });

      if (!category) {
        return {
          success: false,
          error: "카테고리를 찾을 수 없습니다.",
          data: null,
        };
      }

      // SUPERMASTER가 아닌 경우 권한 체크
      if (
        session.user.role !== UserRole.SUPERMASTER &&
        !category.roles?.includes(session.user.role) &&
        category.roles?.length !== 0
      ) {
        return {
          success: false,
          error: "접근 권한이 없습니다.",
          data: null,
        };
      }

      return {
        success: true,
        error: null,
        data: category,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 조회에 실패했습니다.",
      };
    }
  }

  async getCategoryListByIds(
    ids: string[]
  ): Promise<ApiResponse<BoardCategory[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const categories = await prisma.boardCategory.findMany({
        where: {
          id: { in: ids },
          ...(session.user.role !== UserRole.SUPERMASTER && {
            OR: [
              { roles: { has: session.user.role } },
              { roles: { isEmpty: true } },
            ],
          }),
        },
        include: {
          registrant: {
            select: {
              id: true,
              nickname: true,
              image: true,
            },
          },
        },
      });

      return {
        success: true,
        error: null,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 목록 조회에 실패했습니다.",
      };
    }
  }

  // 카테고리 목록 조회
  async getCategoryList(): Promise<ApiResponse<BoardCategory[]>> {
    try {
      const categories = await prisma.boardCategory.findMany({
        orderBy: { createdAt: "desc" },
      });
      return {
        success: true,
        error: null,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 목록 조회에 실패했습니다.",
      };
    }
  }
  async getRecentBoards(): Promise<ApiResponse<RecentBoards>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      // 권한 필터링 조건 수정
      const authFilter =
        session.user.role === UserRole.SUPERMASTER
          ? {}
          : {
              category: {
                roles: {
                  has: session.user.role,
                },
              },
            };

      // 공지사항과 일반 게시글 동시 조회
      const [recentNotices, recentBoards] = await Promise.all([
        prisma.board.findMany({
          where: {
            isNotice: true,
            ...authFilter,
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: commonBoardSelect,
        }),
        prisma.board.findMany({
          where: {
            isNotice: false,
            ...authFilter,
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: commonBoardSelect,
        }),
      ]);

      // 데이터 변환 함수는 그대로 유지
      const transformBoardData = (board: (typeof recentBoards)[0]) => ({
        id: board.id,
        title: board.title,
        createdAt: board.createdAt,
        category: {
          id: board.category?.id || "",
          name: board.category?.name || "",
          roles: board.category?.roles || [],
        },
        registrant: {
          id: board.registrant.id,
          nickname: board.registrant.nickname,
          image: board.registrant.image,
          role: board.registrant.role,
        },
        _count: {
          likes: board._count.likes,
          comments: board._count.comments,
        },
      });

      return {
        success: true,
        error: null,
        data: {
          recentNotices: recentNotices.map(transformBoardData),
          recentBoards: recentBoards.map(transformBoardData),
        },
      };
    } catch (error) {
      console.error("Get recent boards error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "최근 게시글 조회에 실패했습니다.",
        data: null,
      };
    }
  }

  // 좋아요 토글
  async toggleBoardLike(boardId: string): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: { category: true },
      });

      if (!board) {
        return {
          success: false,
          error: "게시글을 찾을 수 없습니다.",
          data: null,
        };
      }

      // 권한 체크
      if (
        session.user.role !== UserRole.SUPERMASTER &&
        !board.category?.roles?.includes(session.user.role) &&
        board.category?.roles?.length !== 0
      ) {
        return { success: false, error: "접근 권한이 없습니다.", data: null };
      }

      const existingLike = await prisma.boardLike.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId: session.user.id as string,
          },
        },
      });
      if (existingLike) {
        await prisma.$transaction(async (tx) => {
          await tx.boardLike.delete({
            where: {
              boardId_userId: {
                boardId,
                userId: session.user!.id as string,
              },
            },
          });
          await logService.writeAdminLog(
            `${this.truncateText(board.title)} 게시글 좋아요 취소`
          );
        });
      } else {
        await prisma.$transaction(async (tx) => {
          await tx.boardLike.create({
            data: {
              boardId,
              userId: session.user!.id as string,
            },
          });
          await logService.writeAdminLog(
            `${this.truncateText(board.title)} 게시글 좋아요`
          );
        });
      }

      return {
        error: null,
        success: true,
        data: !existingLike,
      };
    } catch (error) {
      console.error("Toggle board like error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "좋아요 처리에 실패했습니다.",
      };
    }
  }

  // 좋아요 목록 조회
  async getBoardLikes(boardId: string): Promise<ApiResponse<LikeInfo[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: { category: true },
      });

      if (!board) {
        return {
          success: false,
          error: "게시글을 찾을 수 없습니다.",
          data: null,
        };
      }

      // 권한 체크
      if (
        session.user.role !== UserRole.SUPERMASTER &&
        !board.category?.roles?.includes(session.user.role) &&
        board.category?.roles?.length !== 0
      ) {
        return { success: false, error: "접근 권한이 없습니다.", data: null };
      }

      const likes = await prisma.boardLike.findMany({
        where: { boardId },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        error: null,
        data: likes.map((like) => ({
          id: like.id,
          nickname: like.user.nickname,
          userId: like.user.userId.toString(),
          createdAt: like.createdAt,
        })),
      };
    } catch (error) {
      console.error("Get board likes error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "좋아요 목록 조회에 실패했습니다.",
      };
    }
  }

  async getBoardListsByIdsOrigin(ids: string[]) {
    const session = await auth();

    if (!session || !session.user)
      return {
        success: false,
        error: "세션이 존재하지 않습니다.",
        data: null,
      };

    if (session.user.isPermissive !== true) {
      return {
        success: false,
        error: "권한이 존재하지 않습니다.",
        data: null,
      };
    }

    if (!hasAccess(session.user.role, UserRole.MASTER)) {
      return {
        success: false,
        error: "권한이 존재하지 않습니다.",
        data: null,
      };
    }

    const boards = await prisma.board.findMany({
      where: { id: { in: ids } },
    });

    if (!boards) {
      return {
        success: false,
        error: "게시글을 찾을 수 없습니다.",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: boards,
    };
  }

  async getCategoryListByIdsOrigin(ids: string[]) {
    const session = await auth();
    if (!session || !session.user)
      return {
        success: false,
        error: "세션이 존재하지 않습니다.",
        data: null,
      };

    if (!hasAccess(session.user.role, UserRole.MASTER)) {
      return {
        success: false,
        error: "권한이 존재하지 않습니다.",
        data: null,
      };
    }

    const categories = await prisma.boardCategory.findMany({
      where: { id: { in: ids } },
    });

    if (!categories) {
      return {
        success: false,
        error: "카테고리를 찾을 수 없습니다.",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: categories,
    };
  }

  // 댓글 목록 조회 메서드 추가
  async getComments(boardId: string): Promise<ApiResponse<CommentData[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const comments = await prisma.boardComment.findMany({
        where: { boardId },
        include: {
          registrant: {
            select: {
              id: true,
              nickname: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const transformedComments: CommentData[] = comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        registrant: comment.registrant,
      }));

      return {
        success: true,
        data: transformedComments,
        error: null,
      };
    } catch (error) {
      console.error("Get comments error:", error);
      return {
        success: false,
        error: "댓글 목록 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 텍스트를 4글자로 축약하고 '...'을 추가하는 헬퍼 함수
  private truncateText(text: string): string {
    if (text.length > 4) {
      return `${text.substring(0, 4)}...`;
    }
    return text;
  }

  // 날짜 처리 유틸리티 함수 추가
  private getDateWithoutTime(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
  }
}

export const boardService = new BoardService();
