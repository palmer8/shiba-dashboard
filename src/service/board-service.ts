import prisma from "@/db/prisma";
import { Prisma, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { GlobalReturn } from "@/types/global-return";
import { hasAccess } from "@/lib/utils";

interface BoardWithAuthor {
  id: string;
  title: string;
  createdAt: Date;
  registrant: {
    id: string;
    nickname: true;
  };
  commentCount: number;
  views: number;
}

const ITEMS_PER_PAGE = 50;

class BoardService {
  async getRecentBoards() {
    try {
      const [recentNotices, recentBoards] = await Promise.all([
        prisma.board.findMany({
          where: { isNotice: true },
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: { id: true, nickname: true },
            },
            _count: {
              select: { comments: true },
            },
          },
        }),
        prisma.board.findMany({
          where: { isNotice: false },
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: { id: true, nickname: true },
            },
            _count: {
              select: { comments: true },
            },
          },
        }),
      ]);

      return {
        success: true,
        message: "최근 게시글 조회 성공",
        data: {
          recentBoards: recentBoards.map((board) => ({
            id: board.id,
            title: board.title,
            createdAt: board.createdAt,
            views: board.views,
            registrant: {
              id: board.registrant?.id || "",
              nickname: board.registrant?.nickname || "",
            },
            commentCount: board._count.comments,
          })),
          recentNotices: recentNotices.map((notice) => ({
            id: notice.id,
            title: notice.title,
            createdAt: notice.createdAt,
            views: notice.views,
            registrant: notice.registrant,
            commentCount: notice._count.comments,
          })),
        },
        error: null,
      };
    } catch (error) {
      console.error("Get recent boards error:", error);
      return {
        success: false,
        message: "최근 게시글 조회 실패",
        data: null,
        error,
      };
    }
  }

  async getBoardById(id: string, shouldIncreaseViews = true) {
    try {
      if (shouldIncreaseViews) {
        await prisma.board.update({
          where: { id },
          data: { views: { increment: 1 } },
        });
      }

      const board = await prisma.board.findUnique({
        where: { id },
        include: {
          registrant: {
            select: { id: true, nickname: true },
          },
          comments: {
            orderBy: { createdAt: "asc" },
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

      return {
        success: true,
        message: "게시글 조회 성공",
        data: board,
        error: null,
      };
    } catch (error) {
      console.error("Get board by id error:", error);
      return {
        success: false,
        message: "게시글 조회 실패",
        data: null,
        error,
      };
    }
  }

  async getBoards({
    page = 1,
    search,
    startDate,
    endDate,
    searchType,
  }: {
    page: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    searchType?: string;
  }) {
    try {
      const where: Prisma.BoardWhereInput = { isNotice: false };

      if (search) {
        if (searchType === "regis   ") {
          where.registrant = { nickname: { contains: search } };
        } else {
          where.title = { contains: search };
        }
      }

      if (startDate) {
        where.createdAt = { gte: new Date(startDate) };
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt = where.createdAt
          ? Object.assign({}, where.createdAt, { lte: endDateTime })
          : { lte: endDateTime };
      }

      const [notices, boards, totalCount] = await Promise.all([
        prisma.board.findMany({
          where: { isNotice: true },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: { id: true, nickname: true },
            },
            _count: {
              select: { comments: true },
            },
          },
        }),
        prisma.board.findMany({
          where,
          skip: (page - 1) * ITEMS_PER_PAGE,
          take: ITEMS_PER_PAGE,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: { id: true, nickname: true },
            },
            _count: {
              select: { comments: true },
            },
          },
        }),
        prisma.board.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

      return {
        success: true,
        message: "게시글 목록 조회 성공",
        data: {
          data: boards.map((board) => ({
            id: board.id,
            title: board.title,
            createdAt: board.createdAt,
            views: board.views,
            regis: board.registrant,
            commentCount: board._count.comments,
          })),
          notices: notices.map((notice) => ({
            id: notice.id,
            title: notice.title,
            createdAt: notice.createdAt,
            views: notice.views,
            regis: notice.registrant,
            commentCount: notice._count.comments,
          })),
          metadata: {
            currentPage: page,
            totalPages,
            totalCount,
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get boards error:", error);
      return {
        success: false,
        message: "게시글 목록 조회 실패",
        data: null,
        error,
      };
    }
  }

  async writeBoard(title: string, content: string, isNotice: boolean) {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          message: "로그인이 필요합니다.",
          data: null,
          error: null,
        };
      }

      if (isNotice) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (!user || !hasAccess(user.role, UserRole.MASTER)) {
          return {
            success: false,
            message: "공지사항 작성 권한이 없습니다.",
            data: null,
            error: null,
          };
        }
      }

      const board = await prisma.board.create({
        data: {
          title,
          content,
          isNotice,
          registrant: {
            connect: { id: session.user.id },
          },
        },
        include: {
          registrant: {
            select: { id: true, nickname: true },
          },
        },
      });

      return {
        success: true,
        message: "게시글 작성 성공",
        data: board,
        error: null,
      };
    } catch (error) {
      console.error("Write board error:", error);
      return {
        success: false,
        message: "게시글 작성 실패",
        data: null,
        error,
      };
    }
  }

  async writeBoardComment(boardId: string, content: string) {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          message: "로그인이 필요합니다.",
          data: null,
          error: null,
        };
      }

      const comment = await prisma.boardComment.create({
        data: {
          content,
          board: {
            connect: { id: boardId },
          },
          registrant: {
            connect: { id: session.user.id },
          },
        },
        include: {
          registrant: {
            select: { id: true, nickname: true },
          },
        },
      });

      return {
        success: true,
        message: "댓글 작성 성공",
        data: comment,
        error: null,
      };
    } catch (error) {
      console.error("Write comment error:", error);
      return {
        success: false,
        message: "댓글 작성 실패",
        data: null,
        error,
      };
    }
  }

  async updateBoardComment(commentId: string, content: string) {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          message: "로그인이 필요합니다.",
          data: null,
          error: null,
        };
      }

      const comment = await prisma.boardComment.findUnique({
        where: { id: commentId },
        select: { registrantId: true },
      });

      if (!comment) {
        return {
          success: false,
          message: "댓글을 찾을 수 없습니다.",
          data: null,
          error: null,
        };
      }

      if (comment.registrantId !== session.user.id) {
        return {
          success: false,
          message: "댓글 작성자만 수정할 수 있습니다.",
          data: null,
          error: null,
        };
      }

      const updatedComment = await prisma.boardComment.update({
        where: { id: commentId },
        data: {
          content,
          updatedAt: new Date(),
        },
        include: {
          registrant: {
            select: { id: true, nickname: true },
          },
        },
      });

      return {
        success: true,
        message: "댓글 수정 성공",
        data: updatedComment,
        error: null,
      };
    } catch (error) {
      console.error("Update comment error:", error);
      return {
        success: false,
        message: "댓글 수정 실패",
        data: null,
        error,
      };
    }
  }

  async deleteBoardComment(commentId: string): Promise<GlobalReturn<boolean>> {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          message: "로그인이 필요합니다.",
          data: null,
          error: null,
        };
      }

      const comment = await prisma.boardComment.findUnique({
        where: { id: commentId },
        select: { registrantId: true },
      });

      if (!comment) {
        return {
          success: false,
          message: "댓글을 찾을 수 없습니다.",
          data: null,
          error: null,
        };
      }

      if (comment.registrantId !== session.user.id) {
        return {
          success: false,
          message: "댓글 작성자만 삭제할 수 있습니다.",
          data: null,
          error: null,
        };
      }

      await prisma.boardComment.delete({
        where: { id: commentId },
      });

      return {
        success: true,
        message: "댓글 삭제 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Delete comment error:", error);
      return {
        success: false,
        message: "댓글 삭제 실패",
        data: null,
        error,
      };
    }
  }

  async updateBoard(
    id: string,
    title: string,
    content: string,
    isNotice: boolean
  ) {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          message: "로그인이 필요합니다.",
          data: null,
          error: null,
        };
      }

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
          message: "게시글 수정 권한이 없습니다.",
          data: null,
          error: null,
        };
      }

      if (isNotice) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (!user || !hasAccess(user.role, UserRole.MASTER)) {
          return {
            success: false,
            message: "공지사항 수정 권한이 없습니다.",
            data: null,
            error: null,
          };
        }
      }

      const updatedBoard = await prisma.board.update({
        where: { id },
        data: {
          title,
          content,
          isNotice,
          updatedAt: new Date(),
        },
        include: {
          registrant: {
            select: { id: true, nickname: true },
          },
        },
      });

      return {
        success: true,
        message: "게시글 수정 성공",
        data: updatedBoard,
        error: null,
      };
    } catch (error) {
      console.error("Update board error:", error);
      return {
        success: false,
        message: "게시글 수정 실패",
        data: null,
        error,
      };
    }
  }

  async deleteBoard(boardId: string): Promise<GlobalReturn<boolean>> {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          message: "로그인이 필요합니다.",
          data: null,
          error: null,
        };
      }

      const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: { registrantId: true, isNotice: true },
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
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (!user || !hasAccess(user.role, UserRole.MASTER)) {
          return {
            success: false,
            message: "게시글 삭제 권한이 없습니다.",
            data: null,
            error: null,
          };
        }
      }

      await prisma.board.delete({
        where: { id: boardId },
      });

      return {
        success: true,
        message: "게시글 삭제 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Delete board error:", error);
      return {
        success: false,
        message: "게시글 삭제 실패",
        data: null,
        error,
      };
    }
  }
}

export const boardService = new BoardService();
