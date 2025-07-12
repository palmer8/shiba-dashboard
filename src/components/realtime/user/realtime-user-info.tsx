"use client";

import { RealtimeGameUserData } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatKoreanDateTime,
  formatKoreanNumber,
  getFirstNonEmojiCharacter,
} from "@/lib/utils";
import { parseCustomDateString } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Undo2,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Link,
  Loader2 as LoadingSpinner,
  Save,
  X,
  ChevronDown,
  Shield,
  ShieldCheck,
} from "lucide-react";
import IncidentReportTable from "@/components/report/incident-report-table";
import { Session } from "next-auth";
import {
  returnPlayerSkinAction,
  deleteMemoAction,
  deleteChunobotAction,
  updateJailAction,
  createMemoAction,
  updateWarningCountAction,
  getUserIdsAction,
  updateUserIdBannedAction,
  deleteUserIdsAction,
  updateUserIdentifierAction,
  addUserIdentifierAction,
} from "@/actions/realtime/realtime-action";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, Fragment } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BanPlayerDialog from "@/components/dialog/ban-player-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddUserMemoDialog from "@/components/dialog/add-usermemo-dialog";
import UpdateUserMemoDialog from "@/components/dialog/update-usermemo-dialog";
import AddChunobotDialog from "@/components/dialog/add-chunobot-dialog";
import UpdateChunobotDialog from "@/components/dialog/update-chunobot-dialog";
import { UserMemo } from "@/types/realtime";
import { Chunobot } from "@/types/user";
import { JailDialog } from "./jail-dialog";
import EditDiscordIdDialog from "@/components/dialog/edit-discordid-dialog";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import ChangeUserIdDialog from "@/components/dialog/change-userid-dialog";
import ChangeUserIdentityDialog from "@/components/dialog/change-user-identity-dialog";
import SetWarningCountDialog from "@/components/dialog/set-warning-count-dialog";
import {
  banUserViaApiAction,
  unbanUserViaApiAction,
  getBanRecordByUserIdAction,
} from "@/actions/ban-action";
import EditUserIdentifierDialog from "./edit-user-identifier-dialog";
import AddUserIdentifierDialog from "./add-user-identifier-dialog";

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
  const [addChunobotOpen, setAddChunobotOpen] = useState(false);
  const [updateChunobotOpen, setUpdateChunobotOpen] = useState(false);
  const [selectedChunobot, setSelectedChunobot] = useState<Chunobot | null>(
    null
  );
  const [jailDialogOpen, setJailDialogOpen] = useState(false);
  const [isJailRelease, setIsJailRelease] = useState(false);
  const [editDiscordIdOpen, setEditDiscordIdOpen] = useState(false);
  const [changeUserIdDialogOpen, setChangeUserIdDialogOpen] = useState(false);
  const [changeUserIdentityDialogOpen, setChangeUserIdentityDialogOpen] =
    useState(false);
  const [isWarningLoading, setIsWarningLoading] = useState(false);
  const [setWarningCountDialogOpen, setSetWarningCountDialogOpen] =
    useState(false);
  
  // vrp_user_ids 관련 상태
  const [userIds, setUserIds] = useState<Array<{
    identifier: string;
    user_id: number;
    banned: number | null;
  }>>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isUserIdsLoading, setIsUserIdsLoading] = useState(false);
  const [editIdentifierDialogOpen, setEditIdentifierDialogOpen] = useState(false);
  const [selectedIdentifier, setSelectedIdentifier] = useState<string>("");
  const [addIdentifierDialogOpen, setAddIdentifierDialogOpen] = useState(false);

  const isMaster =
    session?.user && hasAccess(session.user.role, UserRole.MASTER);
  const canIncrementDecrement =
    session?.user && hasAccess(session.user.role, UserRole.STAFF);
  const canDirectlySet = isMaster;

  useEffect(() => {
    setCanNotResolveBanStatus(!isAdmin && Boolean(data.banned));
  }, [data, isAdmin]);

  // 유저 ID 목록 가져오기
  const fetchUserIds = async () => {
    setIsUserIdsLoading(true);
    try {
      const result = await getUserIdsAction(userId);
      if (result.success && result.data) {
        setUserIds(result.data);
      } else {
        toast({
          title: "유저 ID 목록 조회 실패",
          description: result.error || "목록을 가져올 수 없습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "유저 ID 목록 조회 실패",
        description: "목록을 가져오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUserIdsLoading(false);
    }
  };

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

  const handleEditChunobot = (chunobot: Chunobot) => {
    setSelectedChunobot(chunobot);
    setUpdateChunobotOpen(true);
  };

  const handleDeleteChunobot = async (userId: number) => {
    try {
      const result = await deleteChunobotAction(userId);
      if (result.success) {
        toast({
          title: "추노 알림 삭제 완료",
          description: "추노 알림이 성공적으로 삭제되었습니다.",
        });
        await mutate();
      } else {
        toast({
          title: "추노 알림 삭제 실패",
          description: result.error || "추노 알림 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "추노 알림 삭제 실패",
        description: "추노 알림 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleJailAction = async (
    time: number,
    reason: string,
    isAdminJail: boolean
  ) => {
    if (!session?.user?.nickname) {
      toast({
        title: "오류",
        description: "관리자 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const result = await updateJailAction(userId, time, reason, isAdminJail);

    if (result.success) {
      // 유저 메모 추가
      await createMemoAction(
        userId,
        session.user.nickname,
        `${time === 0 ? "구금 해제" : `${time}분 구금`} - ${reason} ${
          isAdminJail ? "(관리자 구금)" : ""
        }`
      );

      toast({
        title: "구금 처리 성공",
        description:
          time === 0
            ? "구금이 해제되었습니다."
            : `${time}분 구금 처리되었습니다.${
                isAdminJail ? " (관리자 구금)" : ""
              }`,
      });
      mutate();
    } else {
      toast({
        title: "구금 처리 실패",
        description: result.error || "구금 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateWarningCount = async (change: 1 | -1) => {
    if (!data.warningCount && data.warningCount !== 0) return;

    const currentCount = data.warningCount || 0;
    const newCount = currentCount + change;

    if (newCount < 0 || newCount > 7) {
      console.warn("Warning count out of bounds (0-7).");
      return;
    }

    setIsWarningLoading(true);
    try {
      const result = await updateWarningCountAction(userId, newCount);
      if (result.success) {
        toast({
          title: "경고 횟수 변경 성공",
          description: `경고 횟수가 ${newCount}회로 변경되었습니다.`,
        });
        mutate();
      } else {
        toast({
          title: "경고 횟수 변경 실패",
          description: result.error || "경고 횟수 변경 중 오류 발생",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "경고 횟수 변경 실패",
        description: "경고 횟수 변경 중 오류 발생",
        variant: "destructive",
      });
    } finally {
      setIsWarningLoading(false);
    }
  };

  // 유저 ID 상태 변경 핸들러
  const handleUpdateUserIdBanned = async (identifier: string, banned: number) => {
    try {
      const result = await updateUserIdBannedAction(identifier, banned);
      if (result.success) {
        toast({
          title: "상태 변경 성공",
          description: `${identifier}의 상태가 변경되었습니다.`,
        });
        fetchUserIds(); // 목록 새로고침
      } else {
        toast({
          title: "상태 변경 실패",
          description: result.error || "상태 변경 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "상태 변경 실패",
        description: "상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 유저 ID 삭제 핸들러
  const handleDeleteUserIds = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: "선택된 항목 없음",
        description: "삭제할 항목을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`선택된 ${selectedUserIds.length}개의 식별자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await deleteUserIdsAction(selectedUserIds, userId);
      if (result.success) {
        toast({
          title: "삭제 성공",
          description: `${result.data?.deletedCount}개의 식별자가 삭제되었습니다.`,
        });
        setSelectedUserIds([]);
        fetchUserIds(); // 목록 새로고침
      } else {
        toast({
          title: "삭제 실패",
          description: result.error || "삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEditIdentifier = (identifier: string) => {
    setSelectedIdentifier(identifier);
    setEditIdentifierDialogOpen(true);
  };

  const handleUpdateIdentifier = async (oldIdentifier: string, newIdentifier: string) => {
    try {
      const result = await updateUserIdentifierAction(oldIdentifier, newIdentifier);
      if (result.success) {
        toast({
          title: "식별자 수정 성공",
          description: "식별자가 성공적으로 수정되었습니다.",
        });
        await fetchUserIds(); // 목록 새로고침
      } else {
        toast({
          title: "식별자 수정 실패",
          description: result.error || "수정 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "식별자 수정 실패",
        description: "수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSingleIdentifier = async (identifier: string) => {
    if (!confirm(`식별자 "${identifier}"를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await deleteUserIdsAction([identifier], userId);
      if (result.success) {
        toast({
          title: "식별자 삭제 성공",
          description: "식별자가 삭제되었습니다.",
        });
        await fetchUserIds(); // 목록 새로고침
      } else {
        toast({
          title: "식별자 삭제 실패",
          description: result.error || "삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "식별자 삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAddIdentifier = async (identifier: string) => {
    try {
      const result = await addUserIdentifierAction(userId, identifier);
      if (result.success) {
        toast({
          title: "식별자 추가 성공",
          description: "새로운 식별자가 추가되었습니다.",
        });
        await fetchUserIds(); // 목록 새로고침
      } else {
        toast({
          title: "식별자 추가 실패",
          description: result.error || "추가 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "식별자 추가 실패",
        description: "추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // INGAME_ADMIN 이상인지 확인 (session.user가 없을 경우 false)
  const canEditDiscordId = session?.user
    ? hasAccess(session.user.role, UserRole.INGAME_ADMIN)
    : false;

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* 하드밴 안내문구 (모든 권한) */}
      {data.isIdBan && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2 justify-between">
          하드밴 된 이용자입니다
          {isMaster && (
            <Button
              size="sm"
              variant="destructive"
              className="ml-2 h-7 px-3"
              onClick={async () => {
                if (!data.online) {
                  toast({
                    title: "오프라인 유저",
                    description: "해당 유저는 온라인 상태가 아닙니다.",
                    variant: "destructive",
                  });
                  return;
                }
                const banRecordResult = await getBanRecordByUserIdAction(
                  userId.toString()
                );
                if (!banRecordResult.success || !banRecordResult.data) {
                  toast({
                    title: "오류",
                    description:
                      banRecordResult.error ||
                      "해당 유저의 밴 정보를 찾을 수 없습니다.",
                    variant: "destructive",
                  });
                  return;
                }
                const banId = banRecordResult.data.id;
                const res = await unbanUserViaApiAction(banId);
                if (res.success) {
                  toast({
                    title: "하드밴 해제 성공",
                    description: "하드밴이 해제되었습니다.",
                  });
                  mutate();
                } else {
                  toast({
                    title: "하드밴 해제 실패",
                    description: res.error || "해제 중 오류가 발생했습니다.",
                    variant: "destructive",
                  });
                }
              }}
              tabIndex={0}
              aria-label="하드밴 해제"
            >
              해제
            </Button>
          )}
        </div>
      )}
      {/* 헤더 섹션 - 중요 정보 */}
      <div className="my-6">
        <div className="flex items-start gap-6 justify-between">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-lg">
                {getFirstNonEmojiCharacter(data.last_nickname || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
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
          <div className="flex flex-col gap-2 items-end">
            {isMaster && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-auto px-3 flex items-center"
                    tabIndex={0}
                    aria-label="유저 관리"
                  >
                    <span>유저 관리</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setChangeUserIdentityDialogOpen(true)}
                      tabIndex={0}
                      aria-label="유저 정보 수정 (차량/계좌)"
                    >
                      차량/계좌번호 변경
                    </DropdownMenuItem>
                  {canDirectlySet && (
                    <DropdownMenuItem
                      onClick={() => setSetWarningCountDialogOpen(true)}
                      tabIndex={0}
                      aria-label="경고 횟수 변경"
                    >
                      경고 횟수 변경
                    </DropdownMenuItem>
                  )}
                    <DropdownMenuItem
                      onClick={() => setChangeUserIdDialogOpen(true)}
                      tabIndex={0}
                      aria-label="게임 고유번호 변경"
                    >
                      게임 고유번호 변경
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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

      {/* Discord 정보를 별도 탭으로 분리 */}
      <Tabs 
        defaultValue="details" 
        className="space-y-4"
        onValueChange={(value) => {
          if (value === "ids" && userIds.length === 0) {
            fetchUserIds();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="details">상세 정보</TabsTrigger>
            <TabsTrigger value="game">게임 정보</TabsTrigger>
            <TabsTrigger value="discord">디스코드</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">관리자 정보</TabsTrigger>}
            <TabsTrigger value="ban">제재 정보</TabsTrigger>
            <TabsTrigger value="ids">식별자 관리</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            className="h-9"
          >
            <Undo2 className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>

        {/* 상단의 이용 정지/하드밴 버튼 */}
        <div className="flex justify-between items-center mt-4 gap-2">
          <div></div>
          <div className="flex gap-2">
            <Button
              disabled={canNotResolveBanStatus}
              onClick={() => setBanDialogOpen(true)}
            >
              {data.banned ? "정지 해제" : "이용 정지"}
            </Button>
            {isMaster && (
              <Button
                variant={data.isIdBan ? "destructive" : "default"}
                onClick={async () => {
                  if (!data.online) {
                    toast({
                      title: "오프라인 유저",
                      description: "해당 유저는 온라인 상태가 아닙니다.",
                      variant: "destructive",
                    });
                    return;
                  }
                  if (data.isIdBan) {
                    const banRecordResult = await getBanRecordByUserIdAction(
                      userId.toString()
                    );
                    if (!banRecordResult.success || !banRecordResult.data) {
                      toast({
                        title: "오류",
                        description:
                          banRecordResult.error ||
                          "해당 유저의 밴 정보를 찾을 수 없습니다.",
                        variant: "destructive",
                      });
                      return;
                    }
                    const banId = banRecordResult.data.id;
                    const res = await unbanUserViaApiAction(banId);
                    if (res.success) {
                      toast({
                        title: "하드밴 해제 성공",
                        description: "하드밴이 해제되었습니다.",
                      });
                      mutate();
                    } else {
                      toast({
                        title: "하드밴 해제 실패",
                        description:
                          res.error || "해제 중 오류가 발생했습니다.",
                        variant: "destructive",
                      });
                    }
                  } else {
                    // 하드밴 추가
                    const res = await banUserViaApiAction(
                      userId,
                      "관리자 수동 하드밴 (유저 정보)"
                    );
                    if (res.success) {
                      toast({
                        title: "하드밴 추가 성공",
                        description: "하드밴이 적용되었습니다.",
                      });
                      mutate();
                    } else {
                      toast({
                        title: "하드밴 추가 실패",
                        description:
                          res.error || "추가 중 오류가 발생했습니다.",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                className="h-9"
                tabIndex={0}
                aria-label={data.isIdBan ? "하드밴 해제" : "하드밴 추가"}
              >
                {data.isIdBan ? "하드밴 해제" : "하드밴"}
              </Button>
            )}
          </div>
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
                        <div className="flex items-center gap-2">
                          {data.skinId ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help underline decoration-dotted decoration-muted-foreground/50 hover:decoration-muted-foreground transition-colors">
                                    {data.skinName}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>스킨 ID: {data.skinId}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span>{data.skinName}</span>
                          )}
                          {data.skinId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-60 hover:opacity-100 transition-opacity"
                              onClick={() => {
                                navigator.clipboard.writeText(data.skinId || "");
                                toast({
                                  title: "스킨 ID 복사됨",
                                  description: `${data.skinId}가 클립보드에 복사되었습니다.`,
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        장착중인 스킨 없음
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      추노 알림
                    </h3>
                    {!data.chunobot ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddChunobotOpen(true)}
                        className="h-6 px-2 text-xs hover:bg-muted"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        등록
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 hover:bg-muted"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-24">
                          <DropdownMenuItem
                            onClick={() => {
                              if (data.chunobot) {
                                handleEditChunobot(data.chunobot);
                              }
                            }}
                            className="cursor-pointer text-xs"
                          >
                            <Pencil className="mr-2 h-3 w-3" />
                            <span>수정</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (data.chunobot) {
                                handleDeleteChunobot(data.chunobot.user_id);
                              }
                            }}
                            className="text-destructive cursor-pointer text-xs"
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            <span>삭제</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {data.chunobot ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{data.chunobot.adminName}</span>
                        <span>{formatKoreanDateTime(data.chunobot.time)}</span>
                      </div>
                      <p className="text-sm">{data.chunobot.reason}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      등록된 특이사항이 없습니다
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    이모지
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {data.emoji ? (
                      <span className="flex items-center gap-1 px-2 py-1 text-lg">
                        {data.emoji}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        등록된 이모지가 없습니다
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Fragment>
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>유저 메모</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddMemoOpen(true)}
                        className="h-8 hover:bg-muted"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        추가
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.memos && data.memos.length > 0 ? (
                        data.memos.map((memo, index) => (
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
                                <DropdownMenuContent
                                  align="end"
                                  className="w-32"
                                >
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
                          등록된 유저 메모가 없습니다
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Fragment>
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

        <TabsContent value="discord">
          <Card>
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base">디스코드 연동 정보</CardTitle>
              {canEditDiscordId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDiscordIdOpen(true)}
                >
                  {data.discordId ? (
                    <Pencil className="h-3 w-3 mr-1.5" />
                  ) : (
                    <Plus className="h-3 w-3 mr-1.5" />
                  )}
                  {data.discordId ? "ID 변경" : "ID 추가"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6 pt-0 pb-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  저장된 Discord ID
                </h3>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm break-all">
                    {data.discordId || "(없음)"}
                  </p>
                  {data.discordId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const numericId =
                          data.discordId?.replace("discord:", "") || "";
                        navigator.clipboard.writeText(numericId);
                        toast({
                          title: "ID 복사됨",
                          description: "숫자 ID가 복사되었습니다.",
                        });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <Separator />
              {data.discordId ? (
                data.discordData ? (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      {data.discordData.avatarUrl && (
                        <Avatar className="h-16 w-16 border">
                          <AvatarImage
                            src={data.discordData.avatarUrl}
                            alt={data.discordData.username}
                          />
                          <AvatarFallback>
                            {getFirstNonEmojiCharacter(
                              data.discordData.username
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            사용자명 (서버 닉네임)
                          </h3>
                          <p className="text-base font-medium">
                            {data.discordData.username}
                            {data.discordData.nickname &&
                              ` (${data.discordData.nickname})`}
                          </p>
                        </div>
                        {data.discordData.globalName && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              글로벌 이름
                            </h3>
                            <p>{data.discordData.globalName}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            서버 가입일
                          </h3>
                          <p>
                            {formatKoreanDateTime(
                              new Date(data.discordData.joinedAt)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        역할
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {data.discordData.roles.map((role) => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    서버에 참여중이지 않거나 유효하지 않은 Discord ID 입니다.
                  </div>
                )
              ) : (
                <div className="text-center text-muted-foreground text-sm py-4">
                  연동된 디스코드 계정이 없습니다. (ID 추가 버튼으로 등록)
                </div>
              )}
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
                    <p aria-label="경고 횟수">
                      {data.warningCount === null ||
                      data.warningCount === undefined
                        ? "-"
                        : `${data.warningCount}회`}
                    </p>
                    {canIncrementDecrement && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleUpdateWarningCount(1)}
                          disabled={
                            isWarningLoading || (data.warningCount || 0) >= 7
                          }
                          aria-label="경고 증가"
                          tabIndex={0}
                        >
                          {isWarningLoading && (data.warningCount || 0) < 7 ? (
                            <LoadingSpinner className="h-3 w-3 animate-spin" />
                          ) : (
                            "+"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    구금 상태
                  </h3>
                  {data.jailtime ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                          {data.isJailAdmin ? "관리자 구금" : "일반 구금"}
                        </Badge>
                        <span className="text-sm font-medium">
                          {data.jailtime}분
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-fit"
                        onClick={() => {
                          setIsJailRelease(true);
                          setJailDialogOpen(true);
                        }}
                      >
                        구금 해제
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" className="w-fit">
                        정상
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-fit"
                        onClick={() => {
                          setIsJailRelease(false);
                          setJailDialogOpen(true);
                        }}
                      >
                        구금하기
                      </Button>
                    </div>
                  )}
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

        <TabsContent value="ids">
            <Card>
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base">식별자 관리</CardTitle>
                <div className="flex gap-2">
                  {isMaster && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddIdentifierDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        추가
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteUserIds}
                        disabled={selectedUserIds.length === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        선택 삭제 ({selectedUserIds.length})
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUserIds}
                    disabled={isUserIdsLoading}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    {isUserIdsLoading ? "로딩중..." : "새로고침"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {isUserIdsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <LoadingSpinner className="h-6 w-6 animate-spin" />
                  </div>
                ) : userIds.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {isMaster && (
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedUserIds.length === userIds.length}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserIds(userIds.map(id => id.identifier));
                                } else {
                                  setSelectedUserIds([]);
                                }
                              }}
                            />
                          </TableHead>
                        )}
                        <TableHead>식별자</TableHead>
                        <TableHead>상태</TableHead>
                        {isMaster && <TableHead className="w-24">액션</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userIds.map((userIdData) => (
                        <TableRow key={userIdData.identifier}>
                          {isMaster && (
                            <TableCell>
                              <Checkbox
                                checked={selectedUserIds.includes(userIdData.identifier)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedUserIds([...selectedUserIds, userIdData.identifier]);
                                  } else {
                                    setSelectedUserIds(selectedUserIds.filter(id => id !== userIdData.identifier));
                                  }
                                }}
                              />
                            </TableCell>
                          )}
                          <TableCell className="font-mono text-sm">
                            {userIdData.identifier}
                          </TableCell>
                          <TableCell>
                            <Badge variant={userIdData.banned === 0 || userIdData.banned === null ? "outline" : "destructive"}>
                              {userIdData.banned === 0 || userIdData.banned === null ? "정상" : "차단"}
                            </Badge>
                          </TableCell>
                          {isMaster && (
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => handleEditIdentifier(userIdData.identifier)}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    수정
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => 
                                      handleUpdateUserIdBanned(
                                        userIdData.identifier, 
                                        (userIdData.banned === 0 || userIdData.banned === null) ? 1 : 0
                                      )
                                    }
                                  >
                                    {(userIdData.banned === 0 || userIdData.banned === null) ? (
                                      <>
                                        <Shield className="mr-2 h-4 w-4" />
                                        차단
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        차단 해제
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteSingleIdentifier(userIdData.identifier)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    삭제
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    식별자 정보가 없습니다.
                  </div>
                )}
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

      <AddChunobotDialog
        userId={userId}
        session={session}
        open={addChunobotOpen}
        setOpen={setAddChunobotOpen}
        mutate={mutate}
      />

      {selectedChunobot && (
        <UpdateChunobotDialog
          session={session}
          open={updateChunobotOpen}
          setOpen={setUpdateChunobotOpen}
          chunobot={selectedChunobot}
          mutate={mutate}
          onClose={() => {
            setSelectedChunobot(null);
            setUpdateChunobotOpen(false);
          }}
        />
      )}

      <JailDialog
        open={jailDialogOpen}
        onOpenChange={setJailDialogOpen}
        onConfirm={handleJailAction}
        isRelease={isJailRelease}
        currentJailStatus={
          data.isJailAdmin
            ? { isJailAdmin: true, jailtime: data.jailtime }
            : undefined
        }
      />

      {canEditDiscordId && (
        <EditDiscordIdDialog
          open={editDiscordIdOpen}
          setOpen={setEditDiscordIdOpen}
          gameUserId={userId}
          currentDiscordId={data.discordId?.replace("discord:", "") || null}
          mutate={mutate}
        />
      )}

      <ChangeUserIdDialog
        open={changeUserIdDialogOpen}
        setOpen={setChangeUserIdDialogOpen}
        currentUserId={userId}
        session={session}
        mutate={mutate}
      />

      <ChangeUserIdentityDialog
        open={changeUserIdentityDialogOpen}
        setOpen={setChangeUserIdentityDialogOpen}
        userId={userId}
        session={session}
        mutate={mutate}
        currentRegistration={data.registration || ""}
        currentPhone={data.phone || ""}
      />

      {canDirectlySet && (
        <SetWarningCountDialog
          open={setWarningCountDialogOpen}
          setOpen={setSetWarningCountDialogOpen}
          userId={userId}
          currentWarningCount={data.warningCount}
          session={session}
          mutate={mutate}
        />
      )}

      <EditUserIdentifierDialog
        open={editIdentifierDialogOpen}
        setOpen={setEditIdentifierDialogOpen}
        identifier={selectedIdentifier}
        onUpdate={handleUpdateIdentifier}
      />

      <AddUserIdentifierDialog
        open={addIdentifierDialogOpen}
        setOpen={setAddIdentifierDialogOpen}
        userId={userId}
        onAdd={handleAddIdentifier}
      />
    </>
  );
}
