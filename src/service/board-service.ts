import prisma from "@/db/prisma";
import {
  Prisma,
  UserRole,
  Board,
  BoardComment,
  BoardCategory,
} from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { GlobalReturn } from "@/types/global-return";
import { hasAccess } from "@/lib/utils";
import { CategoryForm } from "@/components/dialog/add-category-dialog";
import { JSONContent } from "novel";
import { redirect } from "next/navigation";
import { BoardDetailView, LikeInfo } from "@/types/board";
import { BoardsData } from "@/types/dashboard";
import { ApiResponse } from "@/types/global.dto";

interface BoardFilter {
  page?: number;
  startDate?: string;
  endDate?: string;
  title?: string;
  categoryId?: string;
  registrantId?: string;
}

interface BoardList {
  boards: BoardData[];
  notices: BoardData[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

interface BoardData extends Omit<Board, "content"> {
  registrant: {
    id: string;
    nickname: string;
  };
  category: {
    id: string;
    name: string;
  };
  commentCount: number;
  _count: {
    likes: number;
  };
}

interface BoardDetail extends Board {
  registrant: { id: string; nickname: string };
  category: { id: string; name: string };
  comments: (BoardComment & {
    registrant: { id: string; nickname: string };
  })[];
}

interface RecentBoards {
  recentBoards: {
    id: string;
    title: string;
    createdAt: Date;
    commentCount: number;
    likeCount: number;
    registrant: {
      id: string;
      nickname: string;
    };
  }[];
  recentNotices: {
    id: string;
    title: string;
    createdAt: Date;
    commentCount: number; // 추가
    likeCount: number; // 추가
    registrant: {
      id: string;
      nickname: string;
    };
  }[];
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
          registrantId: session.user.id,
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

      if (board.registrantId !== session.user.id) {
        return {
          success: false,
          error: "수정 권한이 없습니다.",
          data: null,
        };
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
            select: { id: true, nickname: true },
          },
          category: {
            select: { id: true, name: true },
          },
        },
      });

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
        select: { registrantId: true },
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
  // 댓글 생성
  async createComment(data: {
    boardId: string;
    content: string;
  }): Promise<ApiResponse<BoardComment>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const comment = await prisma.boardComment.create({
        data: {
          content: data.content,
          boardId: data.boardId,
          registrantId: session.user.id!,
        },
      });

      return {
        success: true,
        data: comment,
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
            },
          },
        },
      });

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
        select: { registrantId: true },
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

  // 게시글 상세 조회
  async getBoardById(id: string): Promise<ApiResponse<BoardDetailView>> {
    const session = await auth();

    try {
      // 한 번의 쿼리로 모든 관련 데이터를 가져옴
      const board = await prisma.board.findUnique({
        where: { id },
        include: {
          registrant: {
            select: { id: true, nickname: true },
          },
          category: {
            select: { id: true, name: true },
          },
          comments: {
            orderBy: { createdAt: "desc" },
            include: {
              registrant: {
                select: { id: true, nickname: true },
              },
            },
          },
          likes: {
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
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      if (!board) {
        return {
          success: false,
          data: null,
          error: "게시글을 찾을 수 없습니다.",
        };
      }

      // 현재 사용자의 좋아요 여부 확인
      const isLiked = session?.user
        ? board.likes.some(
            (like) => like.user.id === (session.user!.id as string)
          )
        : false;

      return {
        success: true,
        error: null,
        data: {
          ...board,
          content: board.content as unknown as JSONContent,
          isLiked,
          registrant: board.registrant || { id: "", nickname: "정보없음" },
          category: board.category || { id: "", name: "정보없음" },
          likes: board.likes.map((like) => ({
            id: like.id,
            nickname: like.user.nickname,
            userId: like.user.userId.toString(),
            createdAt: like.createdAt,
          })),
        },
      };
    } catch (error) {
      console.error("Get board error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "게시글 조회에 실패했습니다.",
      };
    }
  }

  async getBoardList({
    page = 1,
    ...filters
  }: BoardFilter): Promise<ApiResponse<BoardList>> {
    try {
      const itemsPerPage = 20;
      const skip = (page - 1) * itemsPerPage;

      // 필터 조건 설정
      const where: Prisma.BoardWhereInput = {};

      // 날짜 필터
      if (filters.startDate && filters.endDate) {
        where.createdAt = {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        };
      } else if (filters.startDate) {
        where.createdAt = {
          gte: new Date(filters.startDate),
        };
      } else if (filters.endDate) {
        where.createdAt = {
          lte: new Date(filters.endDate),
        };
      }

      // 제목 필터
      if (filters.title) {
        where.title = {
          contains: filters.title,
        };
      }

      // 카테고리 필터
      if (filters.categoryId && filters.categoryId !== "ALL") {
        where.categoryId = filters.categoryId;
      }

      // 작성자 필터
      if (filters.registrantId) {
        where.registrantId = filters.registrantId;
      }

      // 최근 공지사항 5개와 일반 게시글 목록을 동시에 조회
      const [recentNotices, totalCount, boards] = await Promise.all([
        // 최근 공지사항 5개
        prisma.board.findMany({
          where: { isNotice: true },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: { id: true, nickname: true },
            },
            category: {
              select: { id: true, name: true },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        }),
        // 전체 게시글 수 계산 (최근 공지 5개 제외)
        prisma.board.count({
          where: {
            ...where,
            AND: [
              {
                OR: [
                  { isNotice: false },
                  {
                    isNotice: true,
                    id: {
                      notIn: (
                        await prisma.board.findMany({
                          where: { isNotice: true },
                          take: 5,
                          orderBy: { createdAt: "desc" },
                          select: { id: true },
                        })
                      ).map((notice) => notice.id),
                    },
                  },
                ],
              },
            ],
          },
        }),
        // 페이지네이션된 게시글 목록 (최근 공지 5개 제외)
        prisma.board.findMany({
          where: {
            ...where,
            AND: [
              {
                OR: [
                  { isNotice: false },
                  {
                    isNotice: true,
                    id: {
                      notIn: (
                        await prisma.board.findMany({
                          where: { isNotice: true },
                          take: 5,
                          orderBy: { createdAt: "desc" },
                          select: { id: true },
                        })
                      ).map((notice) => notice.id),
                    },
                  },
                ],
              },
            ],
          },
          skip,
          take: itemsPerPage,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: { id: true, nickname: true },
            },
            category: {
              select: { id: true, name: true },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / itemsPerPage);

      const processedBoards = boards.map((board) => ({
        ...board,
        registrant: board.registrant || { id: "", nickname: "정보없음" },
        category: board.category || { id: "", name: "정보없음" },
        commentCount: board._count.comments,
        _count: {
          likes: board._count.likes,
        },
      }));

      const processedNotices = recentNotices.map((notice) => ({
        ...notice,
        registrant: notice.registrant || { id: "", nickname: "정보없음" },
        category: notice.category || { id: "", name: "정보없음" },
        commentCount: notice._count.comments,
        _count: {
          likes: notice._count.likes,
        },
      }));

      return {
        success: true,
        data: {
          boards: processedBoards,
          notices: processedNotices,
          metadata: {
            currentPage: page,
            totalPages,
            totalCount,
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get board list error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "게시글 목록 조회에 실패했습니다.",
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
          template: data.template,
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
      const boardCount = await prisma.board.count({
        where: { categoryId: id },
      });

      if (boardCount > 0) {
        return {
          success: false,
          error: "이 카테고리를 사용하는 게시글이 있어 삭제할 수 없습니다.",
          data: null,
        };
      }

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

  async getRecentBoards(): Promise<ApiResponse<BoardsData>> {
    try {
      const [recentBoards, recentNotices] = await Promise.all([
        prisma.board.findMany({
          where: { isNotice: false },
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: {
                id: true,
                nickname: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        }),
        prisma.board.findMany({
          where: { isNotice: true },
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: {
                id: true,
                nickname: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        }),
      ]);

      return {
        success: true,
        error: null,
        data: {
          recentBoards: recentBoards.map((board) => ({
            id: board.id,
            title: board.title,
            createdAt: board.createdAt.toISOString(),
            commentCount: board._count.comments,
            likeCount: board._count.likes,
            registrant: board.registrant || {
              id: "",
              nickname: "정보없음",
            },
          })),
          recentNotices: recentNotices.map((notice) => ({
            id: notice.id,
            title: notice.title,
            createdAt: notice.createdAt.toISOString(),
            commentCount: notice._count.comments,
            likeCount: notice._count.likes,
            registrant: notice.registrant || {
              id: "",
              nickname: "정보없음",
            },
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  // 좋아요 토글
  async toggleBoardLike(boardId: string): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const existingLike = await prisma.boardLike.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId: session.user.id as string,
          },
        },
      });

      if (existingLike) {
        await prisma.boardLike.delete({
          where: {
            boardId_userId: {
              boardId,
              userId: session.user.id as string,
            },
          },
        });
      } else {
        await prisma.boardLike.create({
          data: {
            boardId,
            userId: session.user.id as string,
          },
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
    try {
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
}

export const boardService = new BoardService();
