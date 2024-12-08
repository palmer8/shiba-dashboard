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
    registrant: {
      id: string;
      nickname: string;
    };
  }[];
  recentNotices: {
    id: string;
    title: string;
    createdAt: Date;
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
  }): Promise<GlobalReturn<Board>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: null,
        message: "로그인이 필요합니다.",
        data: null,
      };
    }

    try {
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
          ...data,
          registrantId: session.user.id,
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
        data: board,
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
  }): Promise<GlobalReturn<Board>> {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
      };
    }

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
          content: data.content,
          categoryId: data.categoryId,
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
        data: updatedBoard,
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
    if (!session?.user) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
      };
    }

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
    if (!session?.user) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
      };
    }

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
    if (!session?.user) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
      };
    }

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
    if (!session?.user) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
      };
    }

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
  async getBoardById(id: string): Promise<GlobalReturn<BoardDetail>> {
    try {
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

      // null 체크 및 기본값 처리
      const processedBoard = {
        ...board,
        registrant: board.registrant || { id: "", nickname: "정보없음" },
        category: board.category || { id: "", name: "정보없음" },
        comments: board.comments.map((comment) => ({
          ...comment,
          registrant: comment.registrant || {
            id: "",
            nickname: "정보없음",
          },
        })),
      };

      // 조회수 증가
      await prisma.board.update({
        where: { id },
        data: { views: { increment: 1 } },
      });

      return {
        success: true,
        message: "게시글을 조회했습니다.",
        data: {
          ...processedBoard,
          content: processedBoard.content as JSONContent,
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
              select: { comments: true },
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
              select: { comments: true },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / itemsPerPage);

      // null 체크 및 타입 변환을 수행
      const processedBoards = boards.map((board) => ({
        ...board,
        registrant: board.registrant || { id: "", nickname: "정보없음" },
        category: board.category || { id: "", name: "정보없음" },
        commentCount: board._count.comments,
      }));

      const processedNotices = notices.map((notice) => ({
        ...notice,
        registrant: notice.registrant || { id: "", nickname: "정보없음" },
        category: notice.category || { id: "", name: "정보없음" },
        commentCount: notice._count.comments,
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
    if (!session?.user) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
      };
    }

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
    if (!session?.user) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
      };
    }

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
    if (!session?.user) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        data: null,
        error: null,
      };
    }

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

  // 최근 게시글 및 공지사항 조회
  async getRecentBoards(): Promise<GlobalReturn<RecentBoards>> {
    try {
      const [recentBoards, recentNotices] = await Promise.all([
        // 일반 게시글 3개
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
              select: { comments: true },
            },
          },
        }),
        // 공지사항 3개
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
          },
        }),
      ]);

      return {
        success: true,
        message: "최근 게시글을 조회했습니다.",
        data: {
          recentBoards: recentBoards.map((board) => ({
            id: board.id,
            title: board.title,
            createdAt: board.createdAt,
            commentCount: board._count.comments,
            registrant: board.registrant || {
              id: "",
              nickname: "정보없음",
            },
          })),
          recentNotices: recentNotices.map((notice) => ({
            id: notice.id,
            title: notice.title,
            createdAt: notice.createdAt,
            registrant: notice.registrant || {
              id: "",
              nickname: "정보없음",
            },
          })),
        },
        error: null,
      };
    } catch (error) {
      console.error("Get recent boards error:", error);
      return {
        success: false,
        message: "최근 게시글 조회에 실패했습니다.",
        data: null,
        error,
      };
    }
  }
}

export const boardService = new BoardService();
