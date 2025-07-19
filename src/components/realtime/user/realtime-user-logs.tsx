"use client";

import useSWR from "swr";
import { getUserPartitionLogsAction } from "@/actions/log-action";
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
import { useRouter, useSearchParams } from "next/navigation";

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [filters, setFilters] = useState({
    type: "",
    level: "",
    message: "",
    metadata: "",
    dateRange: undefined as DateRange | undefined,
  });

  const { data, error, isLoading, mutate } = useSWR(
    [`user-partition-logs-${userId}`, currentPage, filters],
    async ([_, page, filters]) => {
      console.log('로그 조회 요청:', { userId, page, filters });
      const response = await getUserPartitionLogsAction(userId, page, {
        type: filters.type,
        level: filters.level,
        message: filters.message,
        metadata: filters.metadata,
        startDate: filters.dateRange?.from?.toISOString().slice(0, 10),
        endDate: filters.dateRange?.to?.toISOString().slice(0, 10),
      });
      if (!response.success) {
        throw new Error(response.error || "로그를 불러올 수 없습니다.");
      }
      console.log('로그 조회 응답:', response.data);
      return response.data;
    }
  );

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.push(`/realtime/user?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/realtime/user?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
          <Label>메타데이터</Label>
          <Input
            placeholder="메타데이터 검색 (예: user_id, item_id)"
            value={filters.metadata}
            onChange={(e) => handleFilterChange("metadata", e.target.value)}
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
            currentPage: currentPage,
            totalPages: data?.totalPages || 1,
            totalCount: data?.total || 0,
            memoryLogs: data?.memoryLogs || 0,
            databaseLogs: data?.databaseLogs || 0,
            bufferSize: data?.bufferSize || 0,
          }}
          page={currentPage}
          session={session}
          userId={userId}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
