"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Settings,
  Sun,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditUserDialog from "@/components/dialog/edit-user-dialog";
import { formatRole, getFirstNonEmojiCharacter } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import {
  getMyTodayAttendanceAction,
  getMyAttendanceRecordsAction,
} from "@/actions/realtime/realtime-action";
import { format, subDays, startOfDay, endOfDay, differenceInMinutes } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceStats } from "@/components/attendance/attendance-stats";
import { DateRange } from "react-day-picker";

interface NavUserProps {
  session: Session;
}

export function NavUser({ session }: NavUserProps) {
  const { setTheme, theme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState<string | null>(null);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // 최근 2주 날짜 범위 계산
  const recentTwoWeeksRange: DateRange = useMemo(() => {
    const today = new Date();
    const twoWeeksAgo = subDays(today, 13); // 14일간 (오늘 포함)
    return {
      from: startOfDay(twoWeeksAgo),
      to: endOfDay(today)
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    setTodayLoading(true);
    setTodayError(null);
    getMyTodayAttendanceAction()
      .then((result) => {
        if (ignore) return;
        if (result.success) {
          setTodayAttendance(result.data);
        } else {
          setTodayAttendance(null);
          setTodayError(result.error || "-");
        }
      })
      .catch(() => {
        if (ignore) return;
        setTodayAttendance(null);
        setTodayError("-");
      })
      .finally(() => {
        if (ignore) return;
        setTodayLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenRecords = async () => {
    setRecordsOpen(true);
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const result = await getMyAttendanceRecordsAction();
      if (result.success) {
        setAttendanceRecords(result.data ?? []);
      } else {
        setAttendanceRecords([]);
        setRecordsError(result.error || "근태 기록을 불러오지 못했습니다.");
      }
    } catch (e) {
      setAttendanceRecords([]);
      setRecordsError("근태 기록을 불러오지 못했습니다.");
    }
    setRecordsLoading(false);
  };

  let todaySummary: React.ReactNode = null;
  if (todayLoading) {
    todaySummary = (
      <span className="text-xs text-muted-foreground">로딩중...</span>
    );
  } else if (todayError) {
    todaySummary = <span className="text-xs text-destructive">-</span>;
  } else if (!todayAttendance) {
    todaySummary = <span className="text-xs text-destructive">미출근</span>;
  } else if (todayAttendance.checkInTime && !todayAttendance.checkOutTime) {
    todaySummary = (
      <span className="text-xs text-primary">
        출근 {format(new Date(todayAttendance.checkInTime), "HH:mm")} (출근 중)
      </span>
    );
  } else if (todayAttendance.checkInTime && todayAttendance.checkOutTime) {
    todaySummary = (
      <span className="text-xs">
        {format(new Date(todayAttendance.checkInTime), "HH:mm")} ~{" "}
        {format(new Date(todayAttendance.checkOutTime), "HH:mm")}
      </span>
    );
  } else {
    todaySummary = <span className="text-xs text-destructive">미출근</span>;
  }

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };

  const handleThemeChange = (e: React.MouseEvent) => {
    e.preventDefault();
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            className="w-full justify-start gap-2 px-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user?.image || undefined} />
              <AvatarFallback>
                {getFirstNonEmojiCharacter(session.user?.nickname)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden text-left">
              <p className="truncate text-sm font-medium">
                {session.user?.nickname}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {formatRole(session.user?.role as UserRole)}
              </p>
              {/* <div className="truncate mt-0.5">{todaySummary}</div> */}
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]"
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={session.user?.image || undefined} />
                <AvatarFallback>{session.user?.nickname?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">{session.user?.nickname}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRole(session.user?.role as UserRole)}
                </p>
                <div className="truncate mt-0.5">{todaySummary}</div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={(e) => {
                e.preventDefault();
                setDialogOpen(true);
              }}
            >
              <Settings className="h-4 w-4" />
              <span>계정 정보 수정</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={(e) => {
                e.preventDefault();
                handleOpenRecords();
              }}
            >
              <UserIcon className="h-4 w-4" />
              <span>내 근태 상세 보기</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-2" onClick={handleThemeChange}>
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span>{theme === "dark" ? "라이트 모드" : "다크 모드"}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 p-2 text-red-500 focus:text-red-500"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span>로그아웃</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditUserDialog
        session={session}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <Dialog open={recordsOpen} onOpenChange={setRecordsOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>내 근태 기록 (최근 2주)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {recordsLoading ? (
              <div className="text-center py-6">로딩 중...</div>
            ) : recordsError ? (
              <div className="text-center text-destructive py-6">
                {recordsError}
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                근태 기록이 없습니다.
              </div>
            ) : (
              <Tabs defaultValue="list" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">상세 기록</TabsTrigger>
                  <TabsTrigger value="stats">통계 분석</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="flex-1 overflow-auto">
                  <div className="overflow-auto max-h-[60vh]">
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="py-2 px-2 text-left">날짜</th>
                          <th className="py-2 px-2 text-left">출근</th>
                          <th className="py-2 px-2 text-left">퇴근</th>
                          <th className="py-2 px-2 text-left">근무시간</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((record) => {
                          const workMinutes = record.checkInTime && record.checkOutTime
                            ? differenceInMinutes(
                                new Date(record.checkOutTime),
                                new Date(record.checkInTime)
                              )
                            : 0;
                          
                          const formatWorkTime = (minutes: number) => {
                            if (minutes <= 0) return "-";
                            const hours = Math.floor(minutes / 60);
                            const mins = minutes % 60;
                            return `${hours}시간 ${mins > 0 ? `${mins}분` : ""}`.trim();
                          };
                          
                          return (
                            <tr key={record.id} className="border-b last:border-0">
                              <td className="py-2 px-2 whitespace-nowrap">
                                {format(
                                  new Date(record.checkInTime),
                                  "yyyy-MM-dd (eee)"
                                )}
                              </td>
                              <td className="py-2 px-2">
                                {format(new Date(record.checkInTime), "HH:mm")}
                              </td>
                              <td className="py-2 px-2">
                                {record.checkOutTime ? (
                                  format(new Date(record.checkOutTime), "HH:mm")
                                ) : (
                                  <span className="text-destructive">-</span>
                                )}
                              </td>
                              <td className="py-2 px-2">
                                {formatWorkTime(workMinutes)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="stats" className="flex-1 overflow-auto">
                  <AttendanceStats
                    records={attendanceRecords}
                    dateRange={recentTwoWeeksRange}
                    targetUserNumericId={session.user?.userId}
                    isView={false}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
