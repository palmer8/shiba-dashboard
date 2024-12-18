"use client";

import { WhitelistIP } from "@/types/report";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatKoreanDateTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteWhitelistAction } from "@/actions/report-action";
import { toast } from "@/hooks/use-toast";
import { WHITELIST_STATUS } from "@/constant/constant";
import EditWhitelistDialog from "@/components/dialog/edit-whitelist-dialog";
import Empty from "@/components/ui/empty";

interface WhitelistTableProps {
  data: {
    records: WhitelistIP[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export default function WhitelistTable({ data }: WhitelistTableProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const columns: ColumnDef<WhitelistIP>[] = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "IP 주소",
        accessorKey: "user_ip",
      },
      {
        header: "상태",
        accessorKey: "status",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              row.original.status === 0
                ? "bg-background text-green-700 ring-1 ring-inset ring-green-600/20"
                : row.original.status === 1
                ? "bg-secondary text-red-700 ring-1 ring-inset ring-red-600/20"
                : "bg-muted text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
            }`}
          >
            {
              WHITELIST_STATUS[
                row.original.status as keyof typeof WHITELIST_STATUS
              ]
            }
          </span>
        ),
      },
      {
        header: "설명",
        accessorKey: "comment",
      },
      {
        header: "등록자",
        accessorKey: "registrant",
      },
      {
        header: "등록일시",
        accessorKey: "date",
        cell: ({ row }) => formatKoreanDateTime(row.original.date),
      },
      ...(session?.user?.role === "SUPERMASTER"
        ? [
            {
              id: "actions",
              header: "관리",
              cell: ({ row }: { row: Row<WhitelistIP> }) => {
                const handleDelete = async () => {
                  if (confirm("정말로 이 항목을 삭제하시겠습니까?")) {
                    const result = await deleteWhitelistAction(row.original.id);
                    if (result.success) {
                      toast({
                        title: "IP 관리 항목 삭제 성공",
                        description: "IP 관리 항목이 삭제되었습니다.",
                      });
                    } else {
                      toast({
                        title: "IP 관리 항목 삭제 실패",
                        description: "IP 관리 항목 삭제에 실패했습니다.",
                      });
                    }
                  }
                };

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditWhitelistDialog
                        initialData={row.original}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>수정</span>
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>삭제</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              },
            },
          ]
        : []),
    ],
    [session, router]
  );

  const table = useReactTable({
    data: data.records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-4">
      <Table>
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
          {table.getRowModel().rows.length > 0 ? (
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
          총 {data.total}개 중 {(data.page - 1) * 50 + 1}-
          {Math.min(data.page * 50, data.total)}개 표시
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
    </div>
  );
}
