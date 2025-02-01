"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecipeLog, RecipeLogResponse } from "@/types/log";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useEffect, useState } from "react";
import Empty from "@/components/ui/empty";
import { formatKoreanDateTime, handleDownloadJson2CSV } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { writeAdminLogAction } from "@/actions/log-action";

interface RecipeLogTableProps {
  data: RecipeLogResponse;
}

export function RecipeLogTable({ data }: RecipeLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(data.page.toString());

  useEffect(() => {
    setInputPage(data.page.toString());
  }, [data.page]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`?${params.toString()}`);
  };

  const columns: ColumnDef<RecipeLog>[] = useMemo(
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
        enableHiding: false,
      },
      {
        header: "고유번호",
        accessorKey: "user_id",
      },
      {
        header: "레시피 ID",
        accessorKey: "recipe_id",
      },
      {
        header: "보상 아이템",
        accessorKey: "reward_item",
      },
      {
        header: "제작 일시",
        accessorKey: "create_time",
        cell: ({ row }) => (
          <span>
            {formatKoreanDateTime(new Date(row.original.create_time))}
          </span>
        ),
      },
    ],
    []
  );

  const memorizedData = useMemo(() => data.records, [data.records]);

  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    columns,
    data: memorizedData,
  });

  const handleCSVDownload = async () => {
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedData = selectedRows.map((row) => row.original);
      handleDownloadJson2CSV({
        data: selectedData,
        fileName: "recipe-logs",
      });
      await writeAdminLogAction(
        `${selectedData.length}개 레시피 로그 CSV 다운로드`
      );
      toast.success("CSV 다운로드 성공");
    } catch (error) {
      toast.error("CSV 다운로드 실패");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2">
        <Button
          disabled={table.getSelectedRowModel().rows.length === 0}
          onClick={handleCSVDownload}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          CSV 다운로드
        </Button>
      </div>
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
  );
}
