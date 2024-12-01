import { GlobalTitle } from "@/components/global/global-title";
import { auth } from "@/lib/auth-config";
import { realtimeService } from "@/service/realtime-service";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Shield, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatKoreanDateTime } from "@/lib/utils";
import { RealtimeAdmin } from "@/types/user";

export default async function Home() {
  const session = await auth();
  if (!session?.user) return redirect("/login");

  const { data } = await realtimeService.getAllDashboardData();

  return (
    <main className="space-y-8">
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
            <CardDescription>
              현재 SHIBA에 접속중인 유저 수입니다.
            </CardDescription>
            <div className="text-2xl font-bold">{data.userCount}명</div>
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
            <CardDescription>SHIBA에 접속 중인 어드민입니다.</CardDescription>
            <div className="text-xl font-bold">{data.adminData.count}명</div>
            <div className="mt-2">
              <div className="grid grid-rows-7 grid-flow-col gap-1">
                {data.adminData.users.map((admin: RealtimeAdmin) => (
                  <div
                    key={admin.user_id}
                    className="text-xs text-muted-foreground flex items-center gap-1"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]"></div>
                    {admin.name} ({admin.user_id}번)
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 공지사항</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data.recentBoards?.recentNotices.length &&
            data.recentBoards?.recentNotices.length > 0 ? (
              <div className="space-y-2">
                {data.recentBoards.recentNotices.map((notice) => (
                  <Link
                    key={notice.id}
                    href={`/board/${notice.id}`}
                    className="block space-y-1 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="line-clamp-1 font-medium">
                      {notice.title}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{notice.registrant?.nickname || "정보없음"}</span>
                      <span>•</span>
                      <span>{formatKoreanDateTime(notice.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 게시글</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data.recentBoards?.recentBoards.length &&
            data.recentBoards?.recentBoards.length > 0 ? (
              <div className="space-y-2">
                {data.recentBoards.recentBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/board/${board.id}`}
                    className="block space-y-1 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="line-clamp-1 font-medium">
                      {board.title}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{board.registrant.nickname}</span>
                      <span>•</span>
                      <span>{formatKoreanDateTime(board.createdAt)}</span>
                      <span>•</span>
                      <span>댓글 {board.commentCount}</span>
                    </div>
                  </Link>
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
