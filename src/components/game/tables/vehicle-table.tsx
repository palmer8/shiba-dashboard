"use client";

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
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  formatKoreanDateTime,
  handleDownloadJson2CSV,
  parseSearchParams,
} from "@/lib/utils";
import { Session } from "next-auth";
import Empty from "@/components/ui/empty";
import { VehicleQueryResult } from "@/types/game";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { writeAdminLogAction } from "@/actions/log-action";
import { useDragSelect } from "@/hooks/use-drag-select";

interface VehicleTableProps {
  data: {
    records: VehicleQueryResult[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
  session: Session;
}

export function VehicleTable({ data, session }: VehicleTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableContainerRef = useRef<HTMLTableElement>(null);
  const [inputPage, setInputPage] = useState(data.metadata.page.toString());
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    setInputPage(data.metadata.page.toString());
    setRowSelection({});
  }, [data.metadata.page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [data.metadata.page]);

  const columns: ColumnDef<VehicleQueryResult>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
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
        id: "no",
        header: "No.",
        cell: ({ row, table }) => {
          const visibleRows = table.getRowModel().rows;
          const index = visibleRows.findIndex((r) => r.id === row.id);
          return (data.metadata.page - 1) * 50 + index + 1;
        },
      },
      {
        header: "고유번호",
        accessorKey: "id",
      },
      {
        header: "닉네임",
        accessorKey: "nickname",
      },
      {
        header: "최초 접속일",
        accessorKey: "first_join",
        cell: ({ row }) =>
          row.original.first_join
            ? formatKoreanDateTime(row.original.first_join)
            : "정보없음",
      },
      {
        header: "차량 모델",
        accessorKey: "vehicle",
      },
      {
        header: "차량 번호판",
        accessorKey: "vehicle_plate",
        cell: ({ row }) => row.original.vehicle_plate || "EMPTY",
      },
    ],
    [data.metadata.page]
  );

  const table = useReactTable({
    data: data.records,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  const { tableProps, getRowProps } = useDragSelect(table);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= data.metadata.totalPages) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/log/game?${params.toString()}`, { scroll: false });
      }
    },
    [router, searchParams, data.metadata.totalPages]
  );

  const handleDownloadCSV = async () => {
    const selectedRowsData = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    if (selectedRowsData.length === 0) {
      toast({
        title: "선택된 데이터 없음",
        description: "CSV로 다운로드할 데이터를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    const queryParams = parseSearchParams(searchParams);
    const searchParamsText = queryParams
      ? ` (type=${queryParams.type}&value=${queryParams.value}${
          queryParams.condition ? `&condition=${queryParams.condition}` : ""
        }&page=${data.metadata.page})`
      : "";

    try {
      await writeAdminLogAction(`차량 데이터 CSV 다운로드${searchParamsText}`);
      handleDownloadJson2CSV({
        data: selectedRowsData,
        fileName: `vehicle_data_${new Date().toISOString().slice(0, 10)}`,
      });
      toast({
        title: "CSV 다운로드 성공",
        description: `${selectedRowsData.length}개의 데이터가 다운로드되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "CSV 다운로드 실패",
        description: "로그 기록 또는 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("CSV 다운로드 오류:", error);
    }
  };

  if (!data || data.records.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Empty description="조회된 차량 데이터가 없습니다." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCSV}
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          CSV 다운로드
        </Button>
      </div>
      <div className="rounded-md">
        <Table ref={tableContainerRef} {...tableProps}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    {...getRowProps(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {data.metadata.total.toLocaleString()}개 중{" "}
          {((data.metadata.page - 1) * 50 + 1).toLocaleString()}-
          {Math.min(
            data.metadata.page * 50,
            data.metadata.total
          ).toLocaleString()}
          개 표시 | 선택된 행: {table.getSelectedRowModel().rows.length}
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
                } else if (newPage > data.metadata.totalPages) {
                  newPage = data.metadata.totalPages;
                }
                setInputPage(newPage.toString());
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
