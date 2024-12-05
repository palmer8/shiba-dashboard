"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminLogListResponse } from "@/types/log";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatKoreanDateTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AdminLogTableProps {
  data: AdminLogListResponse;
}

export default function AdminLogTable({ data }: AdminLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>내용</TableHead>
            <TableHead>등록자</TableHead>
            <TableHead>등록일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.records.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{log.content}</TableCell>
              <TableCell>
                {log.registrantNickname ? `${log.registrantNickname}` : "-"}
              </TableCell>
              <TableCell>{formatKoreanDateTime(log.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(data.page - 1)}
          disabled={data.page <= 1}
        >
          이전
        </Button>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={data.page}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page > 0 && page <= data.totalPages) {
                handlePageChange(page);
              }
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
  );
}
