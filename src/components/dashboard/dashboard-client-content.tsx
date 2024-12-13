"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/actions/realtime/realtime-dashboard-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useTransition } from "react";
import { DashboardData } from "@/types/dashboard";
import { ApiResponse } from "@/types/global.dto";

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mt-2" />
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mt-2" />
          <div className="mt-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      {[...Array(2)].map((_, i) => (
        <Card key={`board-${i}`} className="md:col-span-2 min-h-[300px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            {[...Array(6)].map((_, j) => (
              <div key={j} className="flex justify-between items-center py-3">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardClientContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const refreshData = async () => {
    const now = Date.now();
    if (now - lastFetchTime < 30000 && data) return;

    startTransition(async () => {
      try {
        const result = await getDashboardData();
        if (result.success && result.data) {
          setData(result.data);
          setLastFetchTime(now);
        } else {
          console.error("Failed to fetch dashboard data:", result.error);
        }
      } catch (error) {
        console.error("Dashboard refresh error:", error);
      }
    });
  };

  useEffect(() => {
    refreshData();
    // 30초마다 데이터 갱신
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    console.log("No data available, showing skeleton");
    return <DashboardSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className={isPending ? "opacity-60" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">실시간 접속 수</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">{data.userCount}명</div>
          {data.userCount === 0 && (
            <div className="text-muted-foreground text-sm">
              접속자 데이터가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={isPending ? "opacity-60" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">
            실시간 접속 관리자
          </CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xl font-bold">{data.adminData.count}명</div>
          {data.adminData.count === 0 && (
            <div className="text-muted-foreground text-sm">
              접속 중인 관리자가 없습니다.
            </div>
          )}
          <div className="mt-2">
            <div className="grid grid-rows-7 grid-flow-col gap-1">
              {data.adminData.users.map((admin) => (
                <div
                  key={admin.user_id}
                  className="text-xs text-muted-foreground flex items-center gap-1"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" />
                  {admin.name} ({admin.user_id}번)
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={isPending ? "opacity-60" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">
            주간 가입자 현황
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.weeklyStats.map((stat) => (
              <div
                key={stat.date}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-muted-foreground">
                  {new Date(stat.date).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stat.count}명</span>
                  <span
                    className={`text-xs ${
                      stat.changePercentage > 0
                        ? "text-green-500"
                        : stat.changePercentage < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stat.changePercentage > 0 && "+"}
                    {stat.changePercentage}%
                  </span>
                </div>
              </div>
            ))}
            {data.weeklyStats.length === 0 && (
              <div className="text-muted-foreground text-sm">
                통계 데이터가 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">최근 공지사항</CardTitle>
            <Link
              href="/boards"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              더보기 →
            </Link>
          </div>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[300px] overflow-y-auto">
          {data.recentBoards.recentNotices.length > 0 ? (
            <div className="space-y-3">
              {data.recentBoards.recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-center justify-between group hover:bg-muted/50 rounded-lg p-2 transition-colors"
                >
                  <Link
                    href={`/board/${notice.id}`}
                    className="flex items-center gap-2 text-sm flex-1"
                  >
                    <span className="flex-1">{notice.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {notice.commentCount > 0 && (
                        <span className="text-blue-500 font-medium">
                          [{notice.commentCount}]
                        </span>
                      )}
                      {notice.likeCount > 0 && (
                        <span className="flex items-center gap-1 text-rose-500">
                          <Heart className="h-3 w-3" />
                          {notice.likeCount}
                        </span>
                      )}
                    </div>
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
        <CardContent className="h-[300px] overflow-y-auto">
          {data.recentBoards.recentBoards.length > 0 ? (
            <div className="space-y-3">
              {data.recentBoards.recentBoards.map((board) => (
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
    </div>
  );
}
