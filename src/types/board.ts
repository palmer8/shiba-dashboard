import { UserRole } from "@prisma/client";
import { JSONContent } from "novel";

// 기본 게시글 타입 (공통 속성)
export interface BoardBase {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  isNotice: boolean;
}

// 작성자 정보
export interface BoardAuthor {
  id: string;
  nickname: string;
  image: string | null;
  role: UserRole;
}

// 카테고리 정보
export interface BoardCategory {
  id: string;
  name: string;
  roles: UserRole[];
}

// 통계 정보 (좋아요, 댓글 수 등)
export interface BoardStats {
  _count: {
    likes: number;
    comments: number;
  };
}

// 대시보드용 최근 게시글 타입
export interface RecentBoard
  extends Pick<BoardBase, "id" | "title" | "createdAt"> {
  registrant: BoardAuthor;
  category: BoardCategory;
  _count: {
    likes: number;
    comments: number;
  };
}

// 게시글 목록용 타입
export interface BoardData extends BoardBase {
  registrant: BoardAuthor;
  category: BoardCategory;
  excerpt?: string;
  _count: {
    likes: number;
    comments: number;
  };
}

// 게시글 상세 조회용 타입
export interface BoardDetailView extends BoardBase {
  content: JSONContent;
  registrant: BoardAuthor;
  category: BoardCategory;
  comments: CommentData[];
  likes: LikeInfo[];
  isLiked: boolean;
  _count: {
    likes: number;
    comments: number;
  };
}

// 댓글 타입
export interface CommentData {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  registrant: BoardAuthor;
}

// 좋아요 정보
export interface LikeInfo {
  id: string;
  nickname: string;
  userId: string;
  createdAt: Date;
}

// 게시글 목록 응답
export interface BoardList {
  boards: BoardData[];
  notices: BoardData[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

// 게시글 필터
export interface BoardFilter {
  page?: number;
  startDate?: string;
  endDate?: string;
  registrantId?: string;
  categoryId?: string;
  title?: string;
}

// 대시보드용 최근 게시글 목록
export interface RecentBoards {
  recentBoards: RecentBoard[];
  recentNotices: RecentBoard[];
}
