import { Board } from "@prisma/client";
import { JSONContent } from "novel";

// 게시글 작성자 정보
type BoardAuthor = {
  id: string;
  nickname: string;
};

// 게시글 데이터
export interface BoardData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  isNotice: boolean;
  registrant: BoardAuthor;
  category: {
    id: string;
    name: string;
  };
  commentCount: number;
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
  startDate?: string;
  endDate?: string;
  registrantId?: string;
  title?: string;
  categoryId?: string;
  page?: number;
}

// 카테고리 데이터
export interface CategoryData {
  id: string;
  name: string;
  template: JSONContent | null;
}

// 게시글 상세 조회 응답 타입 수정
export interface BoardDetail extends Omit<Board, "content"> {
  content: JSONContent;
  registrant: {
    id: string;
    nickname: string;
  };
  category: {
    id: string;
    name: string;
  };
  comments: Array<{
    id: string;
    content: string;
    boardId: string;
    registrantId: string;
    createdAt: Date;
    updatedAt: Date;
    registrant: {
      id: string;
      nickname: string;
    };
  }>;
  likes: {
    user: {
      id: string;
      nickname: string;
    };
  }[];
  _count: {
    likes: number;
    comments: number;
  };
}

// 좋아요 정보 타입 추가
export interface LikeInfo {
  id: string;
  nickname: string;
  userId: string;
  createdAt: Date;
}

// 클라이언트 컴포넌트용 타입 추가
export interface BoardDetailView extends Omit<BoardDetail, "likes"> {
  isLiked: boolean;
  likes: LikeInfo[];
}
