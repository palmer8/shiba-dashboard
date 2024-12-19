"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Shield,
  FileText,
  MessageSquare,
  TrendingUp,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { formatKoreanDateTime } from "@/lib/utils";
import { DashboardData } from "@/types/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import DashboardSkeleton from "./dashboard-skeleton";

const UserStatsCard = memo(function UserStatsCard({
  userCount,
}: {
  userCount: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium">실시간 접속 수</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{userCount}명</div>
      </CardContent>
    </Card>
  );
});

const AdminStatsCard = memo(function AdminStatsCard({
  adminData,
}: {
  adminData: NonNullable<DashboardData["adminData"]>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium">
          실시간 접속 관리자
        </CardTitle>
        <Shield className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{adminData.count}명</div>
        {adminData.users.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {adminData.users.map((admin) => admin.name).join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

const WeeklyStatsCard = memo(function WeeklyStatsCard({
  weeklyStats,
}: {
  weeklyStats: NonNullable<DashboardData["weeklyStats"]>;
}) {
  const latestStat = weeklyStats[0];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium">주간 신규 유저</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{latestStat?.count || 0}명</div>
        {latestStat && (
          <div className="text-xs text-muted-foreground">
            전일 대비{" "}
            <span
              className={
                latestStat.changePercentage > 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {latestStat.changePercentage}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

const BoardStatsCard = memo(function BoardStatsCard({
  recentBoards,
}: {
  recentBoards: NonNullable<DashboardData["recentBoards"]>;
}) {
  return (
    <>
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">공지사항</CardTitle>
            <Link
              href="/notices"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              더보기 →
            </Link>
          </div>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[200px] overflow-y-auto">
          {recentBoards.recentNotices.length > 0 ? (
            <div className="space-y-3">
              {recentBoards.recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-center justify-between group hover:bg-muted/50 rounded-lg p-2 transition-colors"
                >
                  <Link
                    href={`/board/${notice.id}`}
                    className="flex items-center gap-2 text-sm flex-1"
                  >
                    <span className="flex-1">{notice.title}</span>
                  </Link>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-muted-foreground">
                      {notice.registrant.nickname}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatKoreanDateTime(new Date(notice.createdAt))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              등록된 공지사항이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">최근 게시글</CardTitle>
            <Link
              href="/boards"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              더보기 →
            </Link>
          </div>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[200px] overflow-y-auto">
          {recentBoards.recentBoards.length > 0 ? (
            <div className="space-y-3">
              {recentBoards.recentBoards.map((board) => (
                <div
                  key={board.id}
                  className="flex items-center justify-between group hover:bg-muted/50 rounded-lg p-2 transition-colors"
                >
                  <Link
                    href={`/board/${board.id}`}
                    className="flex items-center gap-2 text-sm flex-1"
                  >
                    <span className="flex-1">{board.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {board.commentCount > 0 && (
                        <span className="text-blue-500 font-medium">
                          [{board.commentCount}]
                        </span>
                      )}
                      {board.likeCount > 0 && (
                        <span className="flex items-center gap-1 text-rose-500">
                          <Heart className="h-3 w-3" />
                          {board.likeCount}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-muted-foreground">
                      {board.registrant.nickname}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatKoreanDateTime(new Date(board.createdAt))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              등록된 게시글이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
});

export default function DashboardClientContent() {
  const { data, error, isLoading } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || "데이터를 불러오는데 실패했습니다."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <UserStatsCard userCount={data.userCount} />
      <AdminStatsCard adminData={data.adminData} />
      <WeeklyStatsCard weeklyStats={data.weeklyStats} />
      <BoardStatsCard recentBoards={data.recentBoards} />
    </div>
  );
}
