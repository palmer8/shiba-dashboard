"use client";

import { RealtimeGameUserData } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatKoreanDateTime,
  formatKoreanNumber,
  getFirstNonEmojiCharacter,
  hasAccess,
} from "@/lib/utils";
import { parseCustomDateString } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Undo2,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import IncidentReportTable from "@/components/report/incident-report-table";
import { Session } from "next-auth";
import { returnPlayerSkinAction } from "@/actions/realtime/realtime-action";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import BanPlayerDialog from "@/components/dialog/ban-player-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddUserMemoDialog from "@/components/dialog/add-usermemo-dialog";
import UpdateUserMemoDialog from "@/components/dialog/update-usermemo-dialog";
import { deleteMemoAction } from "@/actions/realtime/realtime-action";
import { UserMemo } from "@/types/realtime";

interface RealtimeUserInfoProps {
  data: RealtimeGameUserData;
  isAdmin: boolean;
  userId: number;
  session: Session;
  mutate: () => Promise<any>;
}

export default function RealtimeUserInfo({
  data,
  isAdmin,
  userId,
  session,
  mutate,
}: RealtimeUserInfoProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<UserMemo | null>(null);
  const [updateMemoOpen, setUpdateMemoOpen] = useState(false);
  const [addMemoOpen, setAddMemoOpen] = useState(false);
  const [canNotResolveBanStatus, setCanNotResolveBanStatus] = useState(false);

  useEffect(() => {
    setCanNotResolveBanStatus(!isAdmin && Boolean(data.banned));
  }, [data]);

  const handleRevokeSkin = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const result = await returnPlayerSkinAction(userId);

      if (result.success) {
        toast({
          title: "스킨 회수 성공",
          description: "스킨이 성공적으로 회수되었습니다.",
        });
        await mutate();
      } else {
        toast({
          title: "스킨 회수 실패",
          description: result.error || "스킨 회수 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "스킨 회수 실패",
        description: "스킨 회수 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEditMemo = (memo: UserMemo) => {
    setSelectedMemo(memo);
    setUpdateMemoOpen(true);
  };

  const handleDeleteMemo = async (memo: UserMemo) => {
    try {
      const result = await deleteMemoAction(memo);

      if (result.success) {
        toast({
          title: "메모 삭제 성공",
          description: "메모가 성공적으로 삭제되었습니다.",
        });
        await mutate();
      } else {
        toast({
          title: "메모 삭제 실패",
          description: result.error || "메모 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "메모 삭제 실패",
        description: "메모 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* 헤더 섹션 - 중요 정보 */}
      <div className="my-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 relative z-0">
            <AvatarFallback className="text-lg">
              {getFirstNonEmojiCharacter(data.last_nickname || "?")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{data.last_nickname}</h2>
              {data.banned && <Badge variant="destructive">비정상</Badge>}
              {!data.banned &&
                (data.online ? (
                  <Badge variant="outline" className="bg-green-500/50">
                    온라인
                  </Badge>
                ) : (
                  <Badge variant="secondary">오프라인</Badge>
                ))}
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
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="details">상세 정보</TabsTrigger>
            <TabsTrigger value="game">게임 정보</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">관리자 정보</TabsTrigger>}
            <TabsTrigger value="ban">제재 정보</TabsTrigger>
          </TabsList>
          <Button
            disabled={canNotResolveBanStatus}
            onClick={() => setBanDialogOpen(true)}
          >
            {data.banned ? "정지 해제" : "이용 정지"}
          </Button>
        </div>

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
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    뉴비 코드
                  </h3>
                  <p>{data.newbieCode || "-"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    LB폰 번호
                  </h3>
                  <p>{data.lbPhoneNumber || "-"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    LB폰 Pin
                  </h3>
                  {data.lbPhonePin ? (
                    <div
                      className="group relative cursor-pointer inline-block"
                      onClick={() => {
                        navigator.clipboard.writeText(data.lbPhonePin || "");
                        toast({
                          title: "PIN 복사됨",
                          description: "클립보드에 복사되었습니다.",
                        });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <p className="blur-sm group-hover:blur-none transition-all duration-200">
                          {data.lbPhonePin}
                        </p>
                        <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <p>-</p>
                  )}
                </div>
                <div className="space-y-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      장착중인 스킨
                    </h3>
                    {data.skinName && isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm("정말로 이 스킨을 회수하시겠습니까?")) {
                            handleRevokeSkin();
                          }
                        }}
                        disabled={isLoading}
                      >
                        <Undo2 className="w-4 h-4 mr-2" />
                        {isLoading ? "처리중..." : "회수"}
                      </Button>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    {data.skinName ? (
                      <div className="flex items-center justify-between">
                        <span>{data.skinName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        장착중인 스킨 없음
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">특이사항</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddMemoOpen(true)}
                    className="h-8 hover:bg-muted"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    메모 추가
                  </Button>
                </div>

                <div className="space-y-4">
                  {data.memos && data.memos.length > 0 ? (
                    data.memos.map((memo: UserMemo, index: number) => (
                      <div
                        key={index}
                        className="bg-muted/20 rounded-lg p-4 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {memo.adminName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatKoreanDateTime(memo.time)}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem
                                onClick={() => handleEditMemo(memo)}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>수정</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteMemo(memo)}
                                className="text-destructive cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>삭제</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {memo.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-16 text-sm text-muted-foreground bg-muted/20 rounded-lg">
                      등록된 특이사항이 없습니다
                    </div>
                  )}
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
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    경고 횟수
                  </h3>
                  <div className="flex items-center gap-2">
                    <p>{data.warningCount || "-"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    남은 구금 시간
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* <p>{data.warningCount || "-"}</p> */}
                    <p>API 연동 필요</p>
                  </div>
                </div>
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

              <div className="space-y-4">
                <h3 className="text-sm font-medium">제재 이력</h3>
                <IncidentReportTable
                  session={session}
                  data={{
                    records: data.incidentReports || [],
                    metadata: {
                      total: data.incidentReports?.length || 0,
                      page: 1,
                      totalPages: 1,
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {data.last_nickname && (
        <BanPlayerDialog
          session={session}
          userId={userId}
          data={data}
          open={banDialogOpen}
          setOpen={setBanDialogOpen}
          mutate={mutate}
        />
      )}

      <AddUserMemoDialog
        userId={userId}
        session={session}
        open={addMemoOpen}
        setOpen={setAddMemoOpen}
        mutate={mutate}
      />

      {selectedMemo && (
        <UpdateUserMemoDialog
          session={session}
          open={updateMemoOpen}
          setOpen={setUpdateMemoOpen}
          memo={selectedMemo}
          mutate={mutate}
          onClose={() => {
            setSelectedMemo(null);
            setUpdateMemoOpen(false);
          }}
        />
      )}
    </>
  );
}
