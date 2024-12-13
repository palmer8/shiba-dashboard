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
  }): Promise<GlobalReturn<Board>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      // 공지사항 권한 체크
      if (data.isNotice && session.user.role !== "SUPERMASTER") {
        return {
          success: false,
          error: null,
          message: "공지사항 작성 권한이 없습니다.",
          data: null,
        };
      }

      if (data.title.length < 5 || data.title.length > 30) {
        return {
          success: false,
          error: null,
          message: "제목은 5자 이상 30자 이하로 입력해주세요.",
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
        message: "게시글이 작성되었습니다.",
        data: {
          ...board,
          content: data.content,
        },
        error: null,
      };
    } catch (error) {
      console.error("Create board error:", error);
      return {
        success: false,
        message: "게시글 작성에 실패했습니다.",
        data: null,
        error,
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
  }): Promise<GlobalReturn<Board>> {
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
          message: "게시글을 찾을 수 없습니다.",
          data: null,
          error: null,
        };
      }

      if (board.registrantId !== session.user.id) {
        return {
          success: false,
          message: "수정 권한이 없습니다.",
          data: null,
          error: null,
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
        message: "게시글이 수정되었습니다.",
        data: {
          ...updatedBoard,
          content: updatedBoard.content as unknown as JSONContent,
        },
      };
    } catch (error) {
      console.error("Update board error:", error);
      return {
        success: false,
        message: "게시글 수정에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 댓글 생성
  async createComment(data: {
    boardId: string;
    content: string;
  }): Promise<GlobalReturn<BoardComment>> {
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
        message: "댓글이 작성되었습니다.",
        data: comment,
        error: null,
      };
    } catch (error) {
      console.error("Create comment error:", error);
      return {
        success: false,
        message: "댓글 작성에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 댓글 수정
  async updateComment(data: {
    commentId: string;
    content: string;
  }): Promise<
    GlobalReturn<
      BoardComment & { registrant: { id: string; nickname: string } }
    >
  > {
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
        message: "댓글이 수정되었습니다.",
        data: comment,
        error: null,
      };
    } catch (error) {
      console.error("Update comment error:", error);
      return {
        success: false,
        message: "댓글 수정에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 댓글 삭제
  async deleteComment(commentId: string): Promise<GlobalReturn<boolean>> {
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
          error: null,
          message: "댓글을 찾을 수 없습니다.",
          data: null,
        };
      }

      if (comment.registrantId !== session.user.id) {
        return {
          success: false,
          error: null,
          message: "삭제 권한이 없습니다.",
          data: null,
        };
      }

      await prisma.boardComment.delete({
        where: { id: commentId },
      });

      return {
        success: true,
        error: null,
        message: "댓글이 삭제되었습니다.",
        data: true,
      };
    } catch (error) {
      console.error("Delete comment error:", error);
      return {
        success: false,
        message: "댓글 삭제에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 게시글 삭제
  async deleteBoard(id: string): Promise<GlobalReturn<boolean>> {
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
          message: "게시글을 찾을 수 없습니다.",
          data: null,
          error: null,
        };
      }

      if (board.registrantId !== session.user.id) {
        return {
          success: false,
          message: "삭제 권한이 없습니다.",
          data: null,
          error: null,
        };
      }

      await prisma.board.delete({
        where: { id },
      });

      return {
        success: true,
        message: "게시글이 삭제되었습니다.",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Delete board error:", error);
      return {
        success: false,
        message: "게시글 삭제에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 게시글 상세 조회
  async getBoardById(id: string): Promise<GlobalReturn<BoardDetailView>> {
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
          message: "게시글을 찾을 수 없습니다.",
          data: null,
          error: null,
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
        message: "게시글을 조회했습니다.",
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
        error: null,
      };
    } catch (error) {
      console.error("Get board error:", error);
      return {
        success: false,
        message: "게시글 조회에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 게시글 목록 조회
  async getBoardList({
    page = 1,
    ...filters
  }: BoardFilter): Promise<GlobalReturn<BoardList>> {
    try {
      const itemsPerPage = 20;
      const skip = (page - 1) * itemsPerPage;

      const where: Prisma.BoardWhereInput = {
        ...(filters.startDate && {
          createdAt: { gte: new Date(filters.startDate) },
        }),
        ...(filters.endDate && {
          createdAt: { lte: new Date(filters.endDate) },
        }),
        ...(filters.title && {
          title: { contains: filters.title },
        }),
        ...(filters.categoryId && {
          categoryId: filters.categoryId,
        }),
        ...(filters.registrantId && {
          registrantId: filters.registrantId,
        }),
      };

      // 1 번의 쿼리로 모든 데이터를 가져오도록 수정
      const [totalCount, boards, notices] = await Promise.all([
        prisma.board.count({ where }),
        prisma.board.findMany({
          where: { ...where, isNotice: false },
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
                likes: true, // 좋아요 수 추가
              },
            },
          },
        }),
        prisma.board.findMany({
          where: { ...where, isNotice: true },
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
                likes: true, // 좋아요 수 추가
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

      const processedNotices = notices.map((notice) => ({
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
        message: "게시글 목록을 조회했습니다.",
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
        message: "게시글 목록 조회에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 카테고리 생성
  async createCategoryWithTemplate(
    data: CategoryForm
  ): Promise<GlobalReturn<BoardCategory>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        message: "권한이 없습니다.",
        data: null,
        error: null,
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
        success: true,
        message: "카테고리가 생성되었습니다.",
        data: category,
        error: null,
      };
    } catch (error) {
      console.error("Create category error:", error);
      return {
        success: false,
        message: "카테고리 생성에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 카테고리 수정
  async updateCategory(
    id: string,
    data: CategoryForm
  ): Promise<GlobalReturn<BoardCategory>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        message: "권한이 없습니다.",
        data: null,
        error: null,
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
        success: true,
        message: "카테고리가 수정되었습니다.",
        data: category,
        error: null,
      };
    } catch (error) {
      console.error("Update category error:", error);
      return {
        success: false,
        message: "카테고리 수정에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 카테고리 삭제
  async deleteCategory(id: string): Promise<GlobalReturn<BoardCategory>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
      return {
        success: false,
        message: "권한이 없습니다.",
        data: null,
        error: null,
      };
    }

    try {
      // 해당 카테고리를 사용하는 게시글이 있는지 확인
      const boardCount = await prisma.board.count({
        where: { categoryId: id },
      });

      if (boardCount > 0) {
        return {
          success: false,
          message: "이 카테고리를 사용하는 게시글이 있어 삭제할 수 없습니다.",
          data: null,
          error: null,
        };
      }

      const category = await prisma.boardCategory.delete({
        where: { id },
      });

      return {
        success: true,
        message: "카테고리가 삭제되었습니다.",
        data: category,
        error: null,
      };
    } catch (error) {
      console.error("Delete category error:", error);
      return {
        success: false,
        message: "카테고리 삭제에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 카테고리 목록 조회
  async getCategoryList(): Promise<GlobalReturn<BoardCategory[]>> {
    try {
      const categories = await prisma.boardCategory.findMany({
        orderBy: { name: "asc" },
      });

      return {
        success: true,
        message: "카테고리 목록을 조회했습니다.",
        data: categories,
        error: null,
      };
    } catch (error) {
      console.error("Get category list error:", error);
      return {
        success: false,
        message: "카테고리 목록 조회에 실패했습니다.",
        data: null,
        error,
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
  async toggleBoardLike(boardId: string): Promise<GlobalReturn<boolean>> {
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
        success: true,
        message: existingLike
          ? "좋아요가 취소되었습니다."
          : "좋아요를 눌렀습니다.",
        data: !existingLike,
        error: null,
      };
    } catch (error) {
      console.error("Toggle board like error:", error);
      return {
        success: false,
        message: "좋아요 처리에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  // 좋아요 목록 조회
  async getBoardLikes(boardId: string): Promise<GlobalReturn<LikeInfo[]>> {
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
          createdAt: "desc", // 최신순 정렬
        },
      });

      return {
        success: true,
        message: "좋아요 목록을 조회했습니다.",
        data: likes.map((like) => ({
          id: like.id,
          nickname: like.user.nickname,
          userId: like.user.userId.toString(),
          createdAt: like.createdAt,
        })),
        error: null,
      };
    } catch (error) {
      console.error("Get board likes error:", error);
      return {
        success: false,
        message: "좋아요 목록 조회에 실패했습니다.",
        data: null,
        error,
      };
    }
  }
}

export const boardService = new BoardService();
