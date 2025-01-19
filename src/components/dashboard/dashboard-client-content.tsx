"use client";

import { memo, useState, useLayoutEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Shield,
  FileText,
  MessageSquare,
  TrendingUp,
  Heart,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { formatKoreanDateTime } from "@/lib/utils";
import { DashboardData } from "@/types/dashboard";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import DashboardSkeleton from "./dashboard-skeleton";
import { getDashboardData } from "@/actions/realtime/realtime-dashboard-action";
import { RecentBoard } from "@/types/board";
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

const NoticeCard = memo(function NoticeCard({
  notice,
}: {
  notice: NonNullable<DashboardData["recentBoards"]>["recentNotices"][0];
}) {
  const NEW_THRESHOLD = 30 * 60 * 1000; // 30분

  const isNew = useMemo(() => {
    const createdAt = new Date(notice.createdAt);
    const now = new Date();
    return now.getTime() - createdAt.getTime() < NEW_THRESHOLD;
  }, [notice.createdAt]);

  const categoryBadge = useMemo(
    () => <Badge variant="outline">{notice.category?.name}</Badge>,
    [notice.category?.name]
  );

  const avatarSection = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={notice.registrant.image || ""} />
          <AvatarFallback>{notice.registrant.nickname[0]}</AvatarFallback>
        </Avatar>
        <span>{notice.registrant.nickname}</span>
      </div>
    ),
    [notice.registrant]
  );

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <Link href={`/board/${notice.id}`} className="block p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {categoryBadge}
              {isNew && <Badge variant="secondary">NEW</Badge>}
            </div>
            <h3 className="font-medium line-clamp-1">{notice.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {avatarSection}
              <span>{formatKoreanDateTime(new Date(notice.createdAt))}</span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
});

const BoardCard = memo(function BoardCard({ board }: { board: RecentBoard }) {
  const NEW_THRESHOLD = 30 * 60 * 1000; // 30분

  const isNew = useMemo(() => {
    const createdAt = new Date(board.createdAt);
    const now = new Date();
    return now.getTime() - createdAt.getTime() < NEW_THRESHOLD;
  }, [board.createdAt]);

  const categoryBadge = useMemo(
    () => <Badge variant="outline">{board.category.name}</Badge>,
    [board.category.name]
  );

  const avatarSection = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={board.registrant.image || ""} />
          <AvatarFallback>{board.registrant.nickname[0]}</AvatarFallback>
        </Avatar>
        <span>{board.registrant.nickname}</span>
      </div>
    ),
    [board.registrant]
  );

  const statsSection = useMemo(
    () => (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>{board._count.comments}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{board._count.likes}</span>
        </div>
      </div>
    ),
    [board._count]
  );

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <Link href={`/board/${board.id}`} className="block p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {categoryBadge}
              {isNew && <Badge variant="secondary">NEW</Badge>}
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-1">{board.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {avatarSection}
                  <span>{formatKoreanDateTime(new Date(board.createdAt))}</span>
                </div>
              </div>
              {statsSection}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
});

export default function DashboardClientContent() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  useLayoutEffect(() => {
    getDashboardData().then((data) => {
      if (data.success) {
        setData(data.data);
      }
      setMounted(true);
    });
  }, []);

  if (!mounted || !data) return <DashboardSkeleton />;

  return (
    <div className="space-y-4">
      {/* 상단 통계 카드 섹션 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UserStatsCard userCount={data.userCount} />
        {data?.adminData ? (
          <AdminStatsCard adminData={data.adminData} />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">
                실시간 접속 관리자
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        )}
        {data?.weeklyStats ? (
          <WeeklyStatsCard weeklyStats={data.weeklyStats} />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">
                주간 신규 유저
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        )}
        <RealtimeUsersCard />
      </div>

      {/* 게시판 섹션 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 공지사항 */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader className="flex-none border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">공지사항</CardTitle>
              </div>
              <Link
                href="/boards"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                더보기
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 pt-4">
            {!data?.recentBoards ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              ))
            ) : data.recentBoards.recentNotices.length > 0 ? (
              data.recentBoards.recentNotices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 게시글 */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader className="flex-none border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">
                  최근 게시글
                </CardTitle>
              </div>
              <Link
                href="/boards"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                더보기
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 pt-4">
            {!data?.recentBoards ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/6" />
                  </div>
                </div>
              ))
            ) : data.recentBoards.recentBoards.length > 0 ? (
              data.recentBoards.recentBoards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))
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
