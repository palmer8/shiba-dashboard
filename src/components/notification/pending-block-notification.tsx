"use client";

import * as React from "react";
import { Bell, Shield, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  getPendingBlockTicketsCountAction,
  getPendingBlockTicketsWithReportsAction,
} from "@/actions/report-action";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";

interface PendingTicket {
  id: string;
  reportId: number;
  createdAt: Date;
  registrant: {
    id: string;
    nickname: string;
    userId: number;
  };
  report: {
    report_id: number;
    target_user_id: number;
    target_user_nickname: string;
    reason: string;
    incident_time: Date;
  } | null;
}

export function PendingBlockNotification() {
  const { data: session } = useSession();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pendingTickets, setPendingTickets] = useState<PendingTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 권한 체크
  const hasManageAccess = session?.user?.role && hasAccess(session.user.role, UserRole.MASTER);

  const fetchPendingData = async () => {
    // 권한이 없으면 데이터를 가져오지 않음
    if (!hasManageAccess) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [countResult, ticketsResult] = await Promise.all([
        getPendingBlockTicketsCountAction(),
        getPendingBlockTicketsWithReportsAction(),
      ]);

      if (countResult.success && countResult.data !== null) {
        setPendingCount(countResult.data);
      } else {
        setError(countResult.error || "카운트 조회 실패");
      }

      if (ticketsResult.success && ticketsResult.data) {
        setPendingTickets(ticketsResult.data);
      } else {
        setError(ticketsResult.error || "티켓 조회 실패");
      }
    } catch (error) {
      setError("데이터 로딩 중 오류가 발생했습니다.");
      console.error("Fetch pending data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();

    // 권한이 있는 경우에만 30초마다 자동 새로고침
    if (hasManageAccess) {
      const interval = setInterval(fetchPendingData, 30000);
      return () => clearInterval(interval);
    }
  }, [hasManageAccess]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 rounded-full hover:bg-accent/50"
        >
          <Bell className="h-4 w-4" />
          {pendingCount > 0 && (
            <div className="absolute -right-1 -top-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-red-600 rounded-full" />
            </div>
          )}
          <span className="sr-only">알림</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-80 overflow-hidden"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          알림
          {pendingCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {pendingCount}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : !hasManageAccess ? (
            <DropdownMenuItem disabled>
              <span className="text-sm text-muted-foreground py-8 text-center block">
                알림이 없습니다
              </span>
            </DropdownMenuItem>
          ) : error ? (
            <DropdownMenuItem disabled className="text-destructive">
              <span className="text-xs">{error}</span>
            </DropdownMenuItem>
          ) : pendingCount === 0 ? (
            <DropdownMenuItem disabled>
              <span className="text-sm text-muted-foreground py-8 text-center block">
                알림이 없습니다
              </span>
            </DropdownMenuItem>
          ) : (
            <>
              {pendingTickets.map((ticket) => (
                <DropdownMenuItem key={ticket.id} asChild>
                  <Link
                    href="/admin/report"
                    className="flex flex-col items-start gap-1 p-3 hover:bg-accent/50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">
                        {ticket.report?.target_user_nickname ||
                          `사용자 ${ticket.report?.target_user_id}`}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate w-full">
                      요청자: {ticket.registrant.nickname}
                    </div>
                    <div className="text-xs text-muted-foreground truncate w-full">
                      사유: {ticket.report?.reason || "사유 없음"}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
              {pendingCount > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/report"
                      className="text-center text-sm text-primary hover:text-primary/80"
                    >
                      전체 {pendingCount}개 요청 보기
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 