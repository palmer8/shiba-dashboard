"use client";

import useSWR from "swr";
import { getUserRelatedLogsAction } from "@/actions/log-action";
import { useState, useEffect } from "react";
import { UserDataTable } from "@/components/game/user-data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import Empty from "@/components/ui/empty";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";
import { RealtimeUserDataTable } from "./realtime-user-data-log-table";

interface RealtimeUserLogsProps {
  userId: number;
  session: Session;
}

export default function RealtimeUserLogs({
  userId,
  session,
}: RealtimeUserLogsProps) {
  if (session?.user?.role !== UserRole.SUPERMASTER) {
    return <Empty description="접근 권한이 없습니다." />;
  }

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    level: "",
    message: "",
    dateRange: undefined as DateRange | undefined,
  });

  const { data, error, isLoading } = useSWR(
    [`user-logs-${userId}`, page, filters],
    async ([_, page, filters]) => {
      const response = await getUserRelatedLogsAction(userId, page, filters);
      if (!response.success) {
        throw new Error(response.error || "로그를 불러올 수 없습니다.");
      }
      return response.data;
    }
  );

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>로그 타입</Label>
          <Input
            placeholder="로그 타입 입력"
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>로그 레벨</Label>
          <Input
            placeholder="로그 레벨 입력"
            value={filters.level}
            onChange={(e) => handleFilterChange("level", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>메시지</Label>
          <Input
            placeholder="메시지 검색"
            value={filters.message}
            onChange={(e) => handleFilterChange("message", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>기간</Label>
          <DatePickerWithRange
            date={filters.dateRange}
            onSelect={(range) => handleFilterChange("dateRange", range)}
          />
        </div>
      </div>

      {error ? (
        <Empty description={error.message} />
      ) : (
        <RealtimeUserDataTable
          data={data?.records || []}
          metadata={{
            currentPage: data?.page || 1,
            totalPages: data?.totalPages || 1,
            totalCount: data?.total || 0,
          }}
          page={page}
          session={session}
        />
      )}
    </div>
  );
}
