"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKoreanDateTime, handleDownloadJson2CSV } from "@/lib/utils";
import { StaffLog, StaffLogResponse } from "@/types/log";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import Empty from "@/components/ui/empty";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface StaffLogTableProps {
  data: StaffLogResponse;
}

export function StaffLogTable({ data }: StaffLogTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(data.page.toString());

  useEffect(() => {
    setInputPage(data.page.toString());
  }, [data.page]);

  const createLogId = (log: StaffLog) => {
    return `${log.staff_id}-${log.target_id}-${new Date(log.time).getTime()}`;
  };

  const handleSelect = (log: StaffLog) => {
    const logId = createLogId(log);
    setSelectedRows((prev) =>
      prev.includes(logId)
        ? prev.filter((rowId) => rowId !== logId)
        : [...prev, logId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows((prev) =>
      prev.length === data.records.length
        ? []
        : data.records.map((log) => createLogId(log))
    );
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));

    if (newPage < 1 || newPage > data.totalPages) return;

    router.push(`/log/staff?${params.toString()}`);
  };

  const handleDownload = () => {
    try {
      const selectedLogs = data.records.filter((log) => {
        const logId = createLogId(log);
        return selectedRows.includes(logId);
      });

      handleDownloadJson2CSV({
        data: selectedLogs,
        fileName: "staff-logs",
      });

      toast({
        title: "CSV 다운로드 성공",
      });
    } catch (error) {
      toast({
        title: "CSV 다운로드 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  const renderLogCard = (log: StaffLog) => {
    const logId = createLogId(log);

    return (
      <Card key={logId} className="hover:bg-muted/50 transition-colors">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={selectedRows.includes(logId)}
              onCheckedChange={() => handleSelect(log)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select row"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2">
                    {log.description}
                  </h3>

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>
                        처리자: {log.staff_name} ({log.staff_id})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        대상자: {log.target_name} ({log.target_id})
                      </span>
                    </div>
                    <span>{formatKoreanDateTime(new Date(log.time))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // 데이터가 없거나 빈 배열인 경우
  if (!data.records || data.records.length === 0) {
    return <Empty description="데이터가 존재하지 않습니다." />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-400px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedRows.length === data.records.length}
            onCheckedChange={handleSelectAll}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={selectedRows.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            CSV 다운로드
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto space-y-2 min-h-0">
        {data.records.map((log) => renderLogCard(log))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          총 {data.total}개 중 {(data.page - 1) * data.pageSize + 1}-
          {Math.min(data.page * data.pageSize, data.total)}개 표시
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.page - 1)}
            disabled={data.page <= 1}
          >
            이전
          </Button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={(e) => {
                let newPage = parseInt(e.target.value);
                if (isNaN(newPage) || newPage < 1) {
                  newPage = 1;
                  setInputPage("1");
                } else if (newPage > data.totalPages) {
                  newPage = data.totalPages;
                  setInputPage(data.totalPages.toString());
                }
                handlePageChange(newPage);
              }}
              className="w-12 rounded-md border border-input bg-background px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
              max={data.totalPages}
            />
            <span className="text-sm text-muted-foreground">
              / {data.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.page + 1)}
            disabled={data.page >= data.totalPages}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
