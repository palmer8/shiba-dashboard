import { RecentBoards } from "./board";

export interface DashboardData {
  userCount: number;
  adminData: {
    count: number;
    users: Array<{
      user_id: number;
      name: string;
    }>;
  } | null;
  weeklyStats: Array<{
    date: string;
    count: number;
    changePercentage: number;
  }> | null;
  recentBoards: {
    recentNotices: any[];
    recentBoards: any[];
  } | null;
  onlinePlayers: Array<{
    user_id: number;
    name: string;
  }>;
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
    image: string;
  };
  category: {
    id: string;
    name: string;
  };
}
