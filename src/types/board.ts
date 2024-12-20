import { UserRole } from "@prisma/client";
import { JSONContent } from "novel";

// 기본 타입들 정리
export interface BoardBase {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  isNotice: boolean;
}

export interface BoardAuthor {
  id: string;
  nickname: string;
}

export interface BoardCategory {
  id: string;
  name: string;
}

// 게시글 목록용 타입
export interface BoardData extends BoardBase {
  registrant: BoardAuthor;
  category: BoardCategory;
  commentCount: number;
  _count: {
    likes: number;
  };
}

// 게시글 상세 조회용 타입
export interface BoardDetailView extends BoardBase {
  content: JSONContent;
  registrant: BoardAuthor;
  category: BoardCategory;
  comments: CommentData[];
  isLiked: boolean;
  likes: LikeInfo[];
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

// 게시글 목록 메타데이터
export interface BoardMetadata {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

// 게시글 목록 응답
export interface BoardList {
  boards: BoardData[];
  notices: BoardData[];
  metadata: BoardMetadata;
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

// 카테고리 데이터
export interface CategoryData {
  id: string;
  name: string;
  template: JSONContent | null;
}

// 좋아요 정보 타입 추가
export interface LikeInfo {
  id: string;
  nickname: string;
  userId: string;
  createdAt: Date;
}

// 기존 타입들은 유지하면서 새로운 타입 추가
export interface BoardListResponse {
  boards: BoardData[];
  notices: BoardData[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

// 스켈레톤 로딩을 위한 타입
export interface BoardTableSkeleton {
  rows: number;
  columns: number;
}

export interface CommentSectionProps {
  boardId: string;
  comments: CommentData[];
  userId: string;
  userRole: UserRole;
}
