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
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Empty from "@/components/ui/empty";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { handleDownloadJson2CSV, parseSearchParams } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { writeAdminLogAction } from "@/actions/log-action";
import { Session } from "next-auth";
import { useRouter, useSearchParams } from "next/navigation";

interface DataTableProps {
  data: {
    records: {
      id: number;
      nickname: string;
      first_join: Date;
      result: string;
    }[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
  queryType: string;
  session: Session;
}

export function DataTable({ data, queryType, session }: DataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableContainerRef = useRef<HTMLTableElement>(null);

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "no",
      header: "No.",
      cell: ({ row }) => row.index + 1 + (data.metadata.page - 1) * 50,
    },
    {
      header: "닉네임",
      accessorKey: "nickname",
      cell: ({ row }) => `${row.getValue("nickname")} (${row.original.id})`,
    },
    {
      header: "최초 접속일",
      accessorKey: "first_join",
      cell: ({ row }) =>
        new Date(row.getValue("first_join")).toLocaleDateString(),
    },
    {
      header: "결과",
      accessorKey: "result",
    },
  ];

  const table = useReactTable({
    data: data.records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`/log/game?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleDownloadCSV = async () => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    const params = new URLSearchParams(window.location.search);
    const decodedParams = parseSearchParams(params);
    const searchParamsText = decodedParams
      ? ` (type=${decodedParams.type}&value=${decodedParams.value}&condition=${decodedParams.condition}&page=${decodedParams.page})`
      : "";

    await writeAdminLogAction(`${queryType} CSV 다운로드 ${searchParamsText}`);

    handleDownloadJson2CSV({
      data: selectedRows,
      fileName: `${queryType}_data`,
    });

    toast({
      title: "CSV 파일이 다운로드되었습니다.",
    });
  };

  const [inputPage, setInputPage] = useState(data.metadata.page.toString());

  useEffect(() => {
    setInputPage(data.metadata.page.toString());
  }, [data.metadata.page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [data.metadata.page]);

  if (data.records.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Empty description="데이터가 존재하지 않습니다." />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">조회 결과</h2>
        <Button
          disabled={table.getSelectedRowModel().rows.length === 0}
          variant="outline"
          size="sm"
          onClick={handleDownloadCSV}
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
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
              onChange={(e) => {
                setInputPage(e.target.value);
              }}
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
