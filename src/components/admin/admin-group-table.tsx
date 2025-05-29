"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { formatKoreanDateTime } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Groups } from "@prisma/client";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Session } from "next-auth";
import { handleDownloadJson2CSV } from "@/lib/utils";
import { updateGroupAction } from "@/actions/admin-action";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import Empty from "@/components/ui/empty";

interface AdminGroupTableProps {
  data: {
    records: Groups[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
  session: Session;
}

export function AdminGroupTable({ data, session }: AdminGroupTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [inputPage, setInputPage] = useState(data.metadata.page.toString());
  const tableContainerRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    setInputPage(data.metadata.page.toString());
  }, [data.metadata.page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [data.metadata.page]);

  const columns = useMemo<ColumnDef<Groups>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "groupId",
        header: "그룹명",
      },
      {
        accessorKey: "minRole",
        header: "최소 권한",
        cell: ({ row }) => (
          <Select
            value={row.original.minRole}
            onValueChange={async (value) => {
              setIsLoading(true);
              try {
                const result = await updateGroupAction(
                  row.original.groupId,
                  value as UserRole
                );
                if (result.success) {
                  toast({ title: "권한 수정 성공" });
                } else {
                  toast({
                    title: "권한 수정 실패",
                    description: "잠시 후 다시 시도해주세요",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                toast({
                  title: "권한 수정 실패",
                  description: "잠시 후 다시 시도해주세요",
                  variant: "destructive",
                });
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={!hasAccess(session?.user!.role, UserRole.SUPERMASTER)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STAFF">스태프</SelectItem>
              <SelectItem value="INGAME_ADMIN">인게임 관리자</SelectItem>
              <SelectItem value="MASTER">마스터</SelectItem>
              <SelectItem value="SUPERMASTER">슈퍼 마스터</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "생성일",
        cell: ({ row }) => formatKoreanDateTime(row.getValue("createdAt")),
      },
      {
        accessorKey: "updatedAt",
        header: "수정일",
        cell: ({ row }) => formatKoreanDateTime(row.getValue("updatedAt")),
      },
    ],
    [session]
  );

  const table = useReactTable({
    data: data.records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCSVDownload = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const csvData = selectedRows.map((row) => row.original);

    handleDownloadJson2CSV({
      data: csvData,
      fileName: `${formatKoreanDateTime(new Date())}-groups.csv`,
    });

    toast({
      title: "CSV 다운로드 성공",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCSVDownload}
          disabled={isLoading || !table.getSelectedRowModel().rows.length}
        >
          <Download className="h-4 w-4 mr-2" />
          CSV 다운로드
        </Button>
      </div>

      <Table ref={tableContainerRef}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Empty description="데이터가 존재하지 않습니다." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          총 {data.metadata.total}개 중 {(data.metadata.page - 1) * 50 + 1}-
          {Math.min(data.metadata.page * 50, data.metadata.total)}개 표시
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.metadata.page - 1)}
            disabled={data.metadata.page <= 1}
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
                } else if (newPage > data.metadata.totalPages) {
                  newPage = data.metadata.totalPages;
                  setInputPage(data.metadata.totalPages.toString());
                }
                handlePageChange(newPage);
              }}
              className="w-12 rounded-md border border-input bg-background px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
              max={data.metadata.totalPages}
            />
            <span className="text-sm text-muted-foreground">
              / {data.metadata.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.metadata.page + 1)}
            disabled={data.metadata.page >= data.metadata.totalPages}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
