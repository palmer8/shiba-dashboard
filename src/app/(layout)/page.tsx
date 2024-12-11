import { GlobalTitle } from "@/components/global/global-title";
import { auth } from "@/lib/auth-config";
import { realtimeService } from "@/service/realtime-service";
import { boardService } from "@/service/board-service";
import { redirect } from "next/navigation";
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

export default async function Home() {
  const session = await auth();
  if (!session?.user) return redirect("/login");

  const [userCount, adminData, recentBoards, weeklyStats] = await Promise.all([
    realtimeService.getRealtimeUser(),
    realtimeService.getAdminData(),
    boardService.getRecentBoards(),
    realtimeService.getWeeklyNewUsersStats(),
  ]);

  const dashboardData = {
    userCount,
    adminData,
    recentBoards: recentBoards.data || {
      recentBoards: [],
      recentNotices: [],
    },
    weeklyStats,
  };

  return (
    <main>
      <GlobalTitle
        title="대시보드"
        description="SHIBA의 실시간 정보를 한 눈에 확인하세요."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">
              실시간 접속 수
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {dashboardData.userCount}명
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">
              실시간 접속 관리자
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xl font-bold">
              {dashboardData.adminData.count}명
            </div>
            <div className="mt-2">
              <div className="grid grid-rows-7 grid-flow-col gap-1">
                {dashboardData.adminData.users.map((admin: any) => (
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">
              주간 가입자 현황
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.weeklyStats.map((stat) => (
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
                    <span className="font-medium">{stat.count}명</span>
                    <span
                      className={`text-xs ${
                        stat.changePercentage > 0
                          ? "text-green-500"
                          : stat.changePercentage < 0
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.changePercentage > 0 ? "+" : ""}
                      {stat.changePercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">최근 공지사항</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardData.recentBoards.recentNotices.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.recentBoards.recentNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="flex items-center justify-between group"
                  >
                    <Link
                      href={`/board/${notice.id}`}
                      className="flex items-center gap-2 text-sm hover:underline line-clamp-1 flex-1"
                    >
                      <span className="flex-1">{notice.title}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {notice.commentCount > 0 && (
                          <span className="text-blue-500">
                            [{notice.commentCount}]
                          </span>
                        )}
                        {notice.likeCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {notice.likeCount}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-muted-foreground">
                        {notice.registrant.nickname}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatKoreanDateTime(notice.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">최근 게시글</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardData.recentBoards.recentBoards.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.recentBoards.recentBoards.map((board) => (
                  <div
                    key={board.id}
                    className="flex items-center justify-between group"
                  >
                    <Link
                      href={`/board/${board.id}`}
                      className="flex items-center gap-2 text-sm hover:underline line-clamp-1 flex-1"
                    >
                      <span className="flex-1">{board.title}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {board.commentCount > 0 && (
                          <span className="text-blue-500">
                            [{board.commentCount}]
                          </span>
                        )}
                        {board.likeCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {board.likeCount}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-muted-foreground">
                        {board.registrant.nickname}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatKoreanDateTime(board.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                등록된 게시글이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
