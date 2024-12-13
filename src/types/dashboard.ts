// 실시간 접속 관리자 데이터
export interface AdminUser {
  user_id: number;
  name: string;
}

export interface AdminData {
  count: number;
  users: AdminUser[];
}

// 주간 통계 데이터
export interface WeeklyStat {
  date: string;
  count: number;
  changePercentage: number;
}

// 게시글 데이터
export interface BoardUser {
  id: string;
  nickname: string;
}

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  registrant: BoardUser;
}

// 게시판 데이터
export interface BoardsData {
  recentBoards: Board[];
  recentNotices: Board[];
}

// 대시보드 전체 데이터
export interface DashboardData {
  userCount: number;
  adminData: AdminData;
  weeklyStats: WeeklyStat[];
  recentBoards: BoardsData;
}
