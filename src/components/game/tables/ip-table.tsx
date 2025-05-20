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
import { useCallback, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Empty from "@/components/ui/empty";
import {
  formatKoreanDateTime,
  handleDownloadJson2CSV,
  parseSearchParams,
} from "@/lib/utils";
import { Download } from "lucide-react";
import { writeAdminLogAction } from "@/actions/log-action";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Session } from "next-auth";
import { IpResult } from "@/types/game";
import { useRouter, useSearchParams } from "next/navigation";

interface IpTableProps {
  data: {
    records: IpResult[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
  session: Session;
}

export function IpTable({ data, session }: IpTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      cell: ({ row }) => (
        <span>
          {row.original.nickname}({row.original.id})
        </span>
      ),
    },
    {
      header: "최초 접속일",
      accessorKey: "first_join",
      cell: ({ row }) => {
        return row.original.first_join
          ? formatKoreanDateTime(row.original.first_join)
          : "정보없음";
      },
    },
    {
      header: "결과",
      accessorKey: "result",
      cell: ({ row }) => row.original.result,
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
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  if (data.records.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Empty description="데이터가 존재하지 않습니다." />
      </div>
    );
  }

  const handleDownloadCSV = async () => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    const params = new URLSearchParams(window.location.search);
    const decodedParams = parseSearchParams(params);
    const searchParamsText = decodedParams
      ? ` (type=${decodedParams.type}&value=${decodedParams.value}&page=${decodedParams.page})`
      : "";

    await writeAdminLogAction(`IP 데이터 CSV 다운로드 ${searchParamsText}`);

    handleDownloadJson2CSV({
      data: selectedRows,
      fileName: "ip_data",
    });
    toast({ title: "CSV 다운로드 성공" });
  };

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">조회 결과</h2>
      </div>
      <div className="flex justify-end">
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
      <div className="flex justify-end gap-2">
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
  );
}
