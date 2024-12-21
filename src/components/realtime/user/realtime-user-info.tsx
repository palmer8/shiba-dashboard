"use client";

import { RealtimeGameUserData } from "@/types/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatKoreanDateTime, formatKoreanNumber } from "@/lib/utils";
import { parseCustomDateString } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function RealtimeUserInfo({
  data,
  isAdmin,
}: {
  data: RealtimeGameUserData;
  isAdmin: boolean;
}) {
  return (
    <>
      {/* 헤더 섹션 - 중요 정보 */}
      <div className="mb-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-lg">
              {data.last_nickname?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{data.last_nickname}</h2>
              {data.online ? (
                <Badge variant="outline" className="bg-green-500/50">
                  온라인
                </Badge>
              ) : (
                <Badge variant="secondary">오프라인</Badge>
              )}
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span>{data.job}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>가입일: {data.first_join}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 정보 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              현금
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKoreanNumber(Number(data.wallet || 0))}원
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              계좌
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKoreanNumber(Number(data.bank || 0))}원
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              마일리지
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKoreanNumber(Number(data.current_coin || 0))}P
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 정보 탭 */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">상세 정보</TabsTrigger>
          <TabsTrigger value="game">게임 정보</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">관리자 정보</TabsTrigger>}
          <TabsTrigger value="ban">제재 정보</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="grid gap-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    계좌번호
                  </h3>
                  <p>{data.phone}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    차량 번호
                  </h3>
                  <p>{data?.registration || "-"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    최종 접속
                  </h3>
                  <p>
                    {data.last_datetime
                      ? formatKoreanDateTime(
                          parseCustomDateString(data.last_datetime)
                        )
                      : "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    최종 IP
                  </h3>
                  <p>{data.last_ip || "-"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    유저 메모
                  </h3>
                  <p>{data?.chunoreason || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="game">
          <Card>
            <CardContent className="grid gap-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    골드 박스
                  </h3>
                  <p>{formatKoreanNumber(Number(data.credit || 0))}개</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    프리미엄 박스
                  </h3>
                  <p>{formatKoreanNumber(Number(data.credit2 || 0))}개</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardContent className="grid gap-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      보유 캐시
                    </h3>
                    <p>
                      {formatKoreanNumber(Number(data.current_cash || 0))}원
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      누적 캐시
                    </h3>
                    <p>
                      {formatKoreanNumber(Number(data.cumulative_cash || 0))}원
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      등급
                    </h3>
                    <p>{data.tier_reward || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="ban">
          <Card>
            <CardContent className="grid gap-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    처리자
                  </h3>
                  <p>{data.banadmin || "-"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    사유
                  </h3>
                  <p>{data.banreason || "-"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    제재 시간
                  </h3>
                  <p>{data.bantime ? data.bantime : "-"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    상태
                  </h3>
                  {data.banned ? (
                    <Badge variant="destructive">정지</Badge>
                  ) : (
                    <Badge variant="outline">정상</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
