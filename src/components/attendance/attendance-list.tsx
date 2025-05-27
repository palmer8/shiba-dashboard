"use client";

import { cn } from "@/lib/utils";
import {
  format,
  differenceInMinutes,
  parseISO,
  isFuture,
  startOfToday,
  min as minDate,
  addDays,
} from "date-fns";
import { ko } from "date-fns/locale"; // 한국어 로케일 추가
import { DateRange } from "react-day-picker";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceRecordWithUser, SimplifiedUser } from "@/types/attendance"; // 가정된 타입 경로
import { formatRole, UserRole } from "@/lib/utils"; // formatRole 및 UserRole import 추가
import { AttendanceCalendar } from "./attendance-calendar";
import { AttendanceStats } from "./attendance-stats"; // 평균 시간, 주간 추이 카드용
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import useSWR from "swr"; // SWR import
import { getAttendanceRecordsForUserAction } from "@/actions/realtime/realtime-action"; // 서버 액션 import
import {
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isWithinInterval,
} from "date-fns"; // 날짜 계산 함수 추가
import { Button } from "@/components/ui/button"; // 버튼 추가
import { useState, useEffect, useMemo } from "react";

// Props 타입 정의 (만약 @/types/attendance.ts에 없다면 여기에 임시 정의)
interface AttendanceListProps {
  records: AttendanceRecordWithUser[];
  users: SimplifiedUser[];
  expandedAdminId: string | null;
  onExpand: (id: string | null) => void;
  dateRange?: DateRange;
}

// 근무 시간 계산 (분 단위) -> 시간과 분 문자열로 변환
const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
  if (totalMinutes < 0) return "-";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ""}`.trim();
};

export function AttendanceList({
  records,
  users,
  expandedAdminId,
  onExpand,
  dateRange,
}: AttendanceListProps) {
  const expandedUser = users.find((u) => u.id === expandedAdminId);
  const expandedUserNumericId = expandedUser?.userId;

  const [internalDateRange, setInternalDateRange] = useState<
    DateRange | undefined
  >(dateRange);

  // 오늘 날짜 (매번 new Date() 호출 방지)
  const today = useMemo(() => startOfToday(), []);

  // SWR 키는 expandedUserNumericId와 internalDateRange의 from/to 값으로 구성하여 안정성 확보
  const swrKey =
    expandedUserNumericId && internalDateRange?.from && internalDateRange?.to
      ? [
          `/api/attendance/user/${expandedUserNumericId}`,
          expandedUserNumericId,
          format(internalDateRange.from, "yyyy-MM-dd"), // from 날짜 문자열
          format(internalDateRange.to, "yyyy-MM-dd"), // to 날짜 문자열
        ]
      : null;

  const {
    data: userSpecificDataResult,
    error: userSpecificError,
    isLoading: userSpecificIsLoading,
    mutate: mutateUserSpecificData, // 데이터 수동 업데이트를 위함 (필요시)
  } = useSWR(
    swrKey,
    async ([_, userId, fromStr, toStr]) => {
      // SWR fetcher 내에서 DateRange 객체 재생성
      const fetchedDateRange = { from: new Date(fromStr), to: new Date(toStr) };
      return getAttendanceRecordsForUserAction(
        userId as number,
        fetchedDateRange as DateRange
      );
    },
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  // SWR로 가져온 실제 사용자 기록 (펼쳐진 사용자의 internalDateRange에 해당)
  const swrUserRecords = userSpecificDataResult?.data || [];

  // 내부 페이지네이션 핸들러 (월 단위만)
  const moveInternalDateRange = (direction: "prevMonth" | "nextMonth") => {
    if (internalDateRange?.from) {
      let newFrom: Date, newTo: Date;
      switch (direction) {
        case "prevMonth":
          newFrom = startOfMonth(subMonths(internalDateRange.from, 1));
          newTo = endOfMonth(newFrom);
          break;
        case "nextMonth":
          newFrom = startOfMonth(addMonths(internalDateRange.from, 1));
          // 다음 달의 종료일이 오늘을 넘지 않도록 조정
          newTo = minDate([endOfMonth(newFrom), today]);
          break;
        default:
          return;
      }
      // newFrom이 newTo보다 늦으면 newTo를 newFrom과 같게 설정 (예: 다음달 1일이 오늘보다 미래일 때)
      if (newFrom > newTo) newTo = newFrom;
      setInternalDateRange({ from: newFrom, to: newTo });
    }
  };

  useEffect(() => {
    if (expandedAdminId && dateRange?.from && dateRange?.to) {
      // 외부 dateRange를 internalDateRange로 설정할 때도 to 날짜가 오늘을 넘지 않도록 함
      const effectiveTo = minDate([dateRange.to, today]);
      let effectiveFrom = dateRange.from;
      if (effectiveFrom > effectiveTo) effectiveFrom = effectiveTo; // from이 to보다 늦어지는 것 방지

      setInternalDateRange({ from: effectiveFrom, to: effectiveTo });
    } else if (!expandedAdminId) {
      setInternalDateRange(undefined); // 닫히면 초기화
    }
  }, [expandedAdminId, dateRange, today]); // today를 의존성 배열에 추가

  return (
    <div className="space-y-6">
      {users.map((user) => {
        // 요약 정보 계산을 위해 props.records 사용 (해당 사용자의 전체 기간 중 초기 데이터)
        const userRecordsForSummary = records.filter(
          (r) => r.userNumericId === user.userId
        );

        // 이번주 근무 시간 계산
        const calculateThisWeekWorkTime = () => {
          const now = new Date();
          const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 월요일 시작
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // 일요일 끝

          let totalMinutes = 0;
          userRecordsForSummary.forEach((record) => {
            if (record.checkInTime && record.checkOutTime) {
              const checkIn = new Date(record.checkInTime);
              const checkOut = new Date(record.checkOutTime);
              
              // 이번주에 해당하는 근무 기록만 계산
              if (
                checkIn && 
                checkOut && 
                checkOut > checkIn &&
                isWithinInterval(checkIn, { start: weekStart, end: weekEnd })
              ) {
                totalMinutes += differenceInMinutes(checkOut, checkIn);
              }
            }
          });
          return totalMinutes;
        };

        const thisWeekWorkMinutes = calculateThisWeekWorkTime();

        let todayRecordSummary: React.ReactNode = (
          <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-semibold">
            미출근
          </span>
        );
        
        // 현재 시간과 날짜 정보
        const now = new Date();
        const todayIso = format(now, "yyyy-MM-dd");
        const yesterdayIso = format(addDays(now, -1), "yyyy-MM-dd");
        const currentHour = now.getHours();
        
        if (userRecordsForSummary.length > 0) {
          // 오늘 날짜의 기록 찾기
          const todayUserRecords = userRecordsForSummary.filter(
            (r) =>
              format(new Date(r.checkInTime), "yyyy-MM-dd") === todayIso ||
              (r.checkOutTime &&
                format(new Date(r.checkOutTime), "yyyy-MM-dd") === todayIso)
          );

          // 12시 이전이면 전날 체크인 기록도 확인 (체크아웃이 없는 경우)
          let yesterdayWorkingRecord = null;
          if (currentHour < 12) {
            yesterdayWorkingRecord = userRecordsForSummary.find(
              (r) =>
                format(new Date(r.checkInTime), "yyyy-MM-dd") === yesterdayIso &&
                !r.checkOutTime
            );
          }

          // 1. 전날부터 계속 출근 중인 경우 (12시 이전에만 체크)
          if (yesterdayWorkingRecord) {
            todayRecordSummary = (
              <span>
                <span className="font-bold">
                  {format(new Date(yesterdayWorkingRecord.checkInTime), "HH:mm")} 출근
                </span>
                <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
                  출근 중
                </span>
              </span>
            );
          } else {
            // 2. 오늘 체크인만 있고 체크아웃 없음 (출근 중)
            const workingRecord = todayUserRecords.find(
              (r) =>
                format(new Date(r.checkInTime), "yyyy-MM-dd") === todayIso &&
                !r.checkOutTime
            );
            if (workingRecord) {
              todayRecordSummary = (
                <span>
                  <span className="font-bold">
                    {format(new Date(workingRecord.checkInTime), "HH:mm")} 출근
                  </span>
                  <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
                    출근 중
                  </span>
                </span>
              );
            } else {
              // 3. 오늘 체크인, 체크아웃 모두 있는 경우 (완료된 근무)
              const completedRecord = todayUserRecords.find(
                (r) =>
                  format(new Date(r.checkInTime), "yyyy-MM-dd") === todayIso &&
                  r.checkOutTime
              );
              if (completedRecord) {
                todayRecordSummary = (
                  <span>
                    {format(new Date(completedRecord.checkInTime), "HH:mm")} 출근
                    <span className="mx-1 text-muted-foreground">/</span>
                    {format(
                      new Date(completedRecord.checkOutTime!),
                      "HH:mm"
                    )}{" "}
                    퇴근
                  </span>
                );
              }
            }
          }
        }

        return (
          <div key={user.id} className="rounded-lg border bg-card">
            <div
              className={cn(
                "p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors",
                expandedAdminId === user.id && "border-b"
              )}
              onClick={() =>
                onExpand(expandedAdminId === user.id ? null : user.id)
              }
              role="button" // 접근성
              tabIndex={0} // 접근성
              onKeyDown={(e) => {
                // 접근성
                if (e.key === "Enter" || e.key === " ") {
                  onExpand(expandedAdminId === user.id ? null : user.id);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{user.nickname[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.nickname}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {todayRecordSummary}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span>권한: {formatRole(user.role as UserRole)}</span>
                    <span className="ml-2">고유번호: {user.userId}</span>
                    <span className="ml-2">이번주: {formatMinutesToHoursAndMinutes(thisWeekWorkMinutes)}</span>
                  </div>
                </div>
              </div>
              {expandedAdminId === user.id ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {expandedAdminId === user.id && (
              <div className="p-4 space-y-6">
                <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveInternalDateRange("prevMonth")}
                    disabled={userSpecificIsLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> 이전 달
                  </Button>
                  {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveInternalDateRange("prevWeek")}
                          disabled={userSpecificIsLoading}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" /> 이전 주
                        </Button> */}
                  {internalDateRange?.from && (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(internalDateRange.from, "yyyy.MM.dd")}
                      {internalDateRange.to
                        ? ` ~ ${format(internalDateRange.to, "yyyy.MM.dd")}`
                        : ""}
                    </span>
                  )}
                  {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveInternalDateRange("nextWeek")}
                          disabled={userSpecificIsLoading || (internalDateRange?.from ? isFuture(startOfWeek(addWeeks(internalDateRange.from, 1))) : false)}
                        >
                          다음 주 <ChevronRight className="h-4 w-4 ml-1" />
                        </Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveInternalDateRange("nextMonth")}
                    disabled={
                      userSpecificIsLoading ||
                      (internalDateRange?.from
                        ? isFuture(
                            startOfMonth(addMonths(internalDateRange.from, 1))
                          )
                        : false)
                    }
                  >
                    다음 달 <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {userSpecificIsLoading && (
                  <p className="text-center text-muted-foreground py-4">
                    데이터 로딩 중...
                  </p>
                )}
                {userSpecificError && (
                  <p className="text-center text-red-500 py-4">
                    오류:{" "}
                    {userSpecificError.message ||
                      "데이터를 불러오는데 실패했습니다."}
                  </p>
                )}

                {/* 데이터가 없더라도 Tabs 구조는 보여주도록 변경 */}
                {!userSpecificIsLoading && !userSpecificError && (
                  <Tabs defaultValue="timeline" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="timeline">타임라인</TabsTrigger>
                      <TabsTrigger value="list">상세기록</TabsTrigger>
                      <TabsTrigger value="stats">요약통계</TabsTrigger>
                    </TabsList>
                    <TabsContent value="timeline" className="mt-0">
                      <AttendanceCalendar
                        records={swrUserRecords} // 데이터가 비어있을 수 있음
                        targetUserNumericId={expandedUserNumericId}
                        currentDateRange={internalDateRange}
                        users={users}
                      />
                    </TabsContent>
                    <TabsContent value="list" className="mt-0">
                      {swrUserRecords.length > 0 ? (
                        <ScrollArea className="h-[400px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>날짜</TableHead>
                                <TableHead>출근</TableHead>
                                <TableHead>퇴근</TableHead>
                                <TableHead className="text-right">
                                  근무시간
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {swrUserRecords
                                .sort(
                                  (a, b) =>
                                    new Date(b.checkInTime).getTime() -
                                    new Date(a.checkInTime).getTime()
                                )
                                .map((record) => {
                                  const checkInDate = new Date(
                                    record.checkInTime
                                  );
                                  const checkOutDate = record.checkOutTime
                                    ? new Date(record.checkOutTime)
                                    : null;
                                  const checkInDateStr = format(
                                    checkInDate,
                                    "yyyy-MM-dd (eee)",
                                    { locale: ko }
                                  );
                                  const checkInTimeStr = format(
                                    checkInDate,
                                    "HH:mm"
                                  );
                                  let checkOutTimeStr = "-";
                                  let workMinutes = -1;
                                  let isOvernight = false;

                                  if (checkOutDate) {
                                    checkOutTimeStr = format(
                                      checkOutDate,
                                      "HH:mm"
                                    );
                                    workMinutes = differenceInMinutes(
                                      checkOutDate,
                                      checkInDate
                                    );
                                    if (
                                      format(checkInDate, "yyyy-MM-dd") !==
                                      format(checkOutDate, "yyyy-MM-dd")
                                    ) {
                                      isOvernight = true;
                                    }
                                  }
                                  return (
                                    <TableRow key={record.id}>
                                      <TableCell className="font-medium">
                                        {checkInDateStr}
                                      </TableCell>
                                      <TableCell>{checkInTimeStr}</TableCell>
                                      <TableCell>
                                        {checkOutTimeStr}
                                        {isOvernight && (
                                          <span className="ml-1 text-xs text-muted-foreground">
                                            {" "}
                                            (익일)
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatMinutesToHoursAndMinutes(
                                          workMinutes
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          해당 기간에 근무 기록이 없습니다.
                        </p>
                      )}
                    </TabsContent>
                    <TabsContent value="stats" className="mt-0">
                      <AttendanceStats
                        records={swrUserRecords} // 데이터가 비어있을 수 있음
                        dateRange={internalDateRange}
                        targetUserNumericId={expandedUserNumericId}
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
