import { Prisma } from "@prisma/client";

// 게시글 작성자 정보
type BoardAuthor = {
  id: string;
  nickname: string;
};

// 게시글 기본 정보
type BoardBase = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  isNotice: boolean;
  registrantId: string;
};

// 게시글 목록용 정보
export type BoardWithAuthor = {
  id: string;
  title: string;
  createdAt: Date;
  views: number;
  registrant: BoardAuthor;
  commentCount: number;
};

// 댓글 정보
export type BoardComment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  registrant: BoardAuthor;
};

// 상세 게시글 정보
export type BoardDetail = BoardBase & {
  registrant: BoardAuthor;
  comments: BoardComment[];
};

// 게시글 목록 메타데이터
export type BoardMetadata = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

// 게시글 목록 응답
export type BoardList = {
  data: BoardWithAuthor[];
  notices: BoardWithAuthor[];
  metadata: BoardMetadata;
};

// 게시글 검색 조건
export type BoardSearchParams = {
  page: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  searchType?: string;
};

// 게시글 작성/수정 데이터
export type BoardWriteData = {
  title: string;
  content: string;
  isNotice: boolean;
};

// 최근 게시글 응답
export type RecentBoards = {
  recentBoards: BoardWithAuthor[];
  recentNotices: BoardWithAuthor[];
};

// Prisma 쿼리용 타입
export type BoardInclude = Prisma.BoardInclude;
export type BoardWhereInput = Prisma.BoardWhereInput;
export type BoardCommentInclude = Prisma.BoardCommentInclude;

export interface BoardFilter {
  startDate?: string;
  endDate?: string;
  registrantId?: string;
  title?: string;
  page?: number;
}

export interface BoardData {
  id: string;
  title: string;
  createdAt: Date;
  views: number;
  regis: {
    id: string;
    nickname: string;
  };
  commentCount: number;
  isNotice?: boolean;
}
