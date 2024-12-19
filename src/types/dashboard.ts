export interface DashboardData {
  userCount: number;
  adminData: AdminData;
  weeklyStats: WeeklyStat[];
  recentBoards: BoardsData;
}

export interface AdminData {
  count: number;
  users: AdminUser[];
}

export interface AdminUser {
  user_id: number;
  name: string;
}

export interface WeeklyStat {
  date: string;
  count: number;
  changePercentage: number;
}

export interface BoardsData {
  recentBoards: DashBoardRecentBoard[];
  recentNotices: DashBoardRecentBoard[];
}

export interface DashBoardRecentBoard {
  id: string;
  title: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  registrant: {
    id: string;
    nickname: string;
  };
}
