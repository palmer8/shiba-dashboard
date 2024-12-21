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
import { ServerMetricsChart } from "./server-metrics-chart";

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
            {adminData.users
              .map((admin) => admin.name + `(${admin.user_id})`)
              .join(", ")}
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

const RealtimeUsersCard = memo(function RealtimeUsersCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium">
          실시간 대시보드 이용자
        </CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">-</div>
        <div className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            실시간 연결 대기중
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

export default function DashboardClientContent() {
  const { data, error, isLoading } = useDashboard();

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  if (error) {
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
    <div className="space-y-6">
      {/* 상단 통계 카드 섹션 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UserStatsCard userCount={data.userCount} />
        <AdminStatsCard adminData={data.adminData} />
        <WeeklyStatsCard weeklyStats={data.weeklyStats} />
        <RealtimeUsersCard />
      </div>

      {/* 게시판 섹션 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 공지사항 */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader className="flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">공지사항</CardTitle>
              </div>
              <Link
                href="/notices"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                더보기 →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {data.recentBoards.recentNotices.length > 0 ? (
              <div className="space-y-3">
                {data.recentBoards.recentNotices.map((notice) => (
                  <Link
                    key={notice.id}
                    href={`/board/${notice.id}`}
                    className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-medium line-clamp-1">
                        {notice.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {notice.registrant.nickname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatKoreanDateTime(new Date(notice.createdAt))}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 게시글 */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader className="flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">
                  최근 게시글
                </CardTitle>
              </div>
              <Link
                href="/boards"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                더보기 →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {data.recentBoards.recentBoards.length > 0 ? (
              <div className="space-y-3">
                {data.recentBoards.recentBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/board/${board.id}`}
                    className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="text-sm font-medium line-clamp-1">
                          {board.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {board.commentCount > 0 && (
                            <span className="text-xs text-blue-500 font-medium">
                              [{board.commentCount}]
                            </span>
                          )}
                          {board.likeCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-rose-500">
                              <Heart className="h-3 w-3" />
                              {board.likeCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {board.registrant.nickname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatKoreanDateTime(new Date(board.createdAt))}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                등록된 게시글이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ServerMetricsChart />
    </div>
  );
}
