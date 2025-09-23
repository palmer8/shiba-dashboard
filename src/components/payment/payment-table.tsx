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
import { Fragment, useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { formatKoreanDateTime, handleDownloadJson2CSV } from "@/lib/utils";
import { Payment } from "@/types/payment";
import { Checkbox } from "@/components/ui/checkbox";
import Empty from "@/components/ui/empty";
import { useDragSelect } from "@/hooks/use-drag-select";
// import { getPaymentsByIdsOriginAction } from "@/actions/payment-action";
// import { toast } from "@/hooks/use-toast";

interface PaymentTableProps {
  data: {
    items: Payment[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export default function PaymentTable({ data }: PaymentTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableContainerRef = useRef<HTMLTableElement>(null);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [inputPage, setInputPage] = useState(data.page.toString());

  useEffect(() => {
    setInputPage(data.page.toString());
  }, [data.page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [data.page]);

  const columns: ColumnDef<Payment>[] = useMemo(
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
            onClick={(e) => e.stopPropagation()}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "transid",
        header: "거래번호",
        cell: ({ row }) => (
          <div className="font-mono">{row.getValue("transid")}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "이메일",
      },
      {
        accessorKey: "ip",
        header: "IP",
      },
      {
        accessorKey: "price",
        header: "결제금액",
        cell: ({ row }) => (
          <div className="text-right">
            ${row.getValue("price")?.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "결제일시",
        cell: ({ row }) => formatKoreanDateTime(row.getValue("date")),
      },
    ],
    []
  );

  const table = useReactTable({
    data: data.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const { tableProps, getRowProps } = useDragSelect(table);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <Table ref={tableContainerRef} {...tableProps}>
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
              <Fragment key={row.id}>
                <TableRow onClick={() => row.toggleExpanded()} {...getRowProps(row)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="bg-muted/50">
                      <PackageList packageString={row.original.packagename} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
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
    </>
  );
}

function PackageList({ packageString }: { packageString: string }) {
  try {
    const items = JSON.parse(packageString);
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No.</TableHead>
            <TableHead>구매 아이템</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: string, index: number) => (
            <TableRow key={index}>
              <TableCell className="w-[100px]">{index + 1}</TableCell>
              <TableCell>{item}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  } catch (error) {
    return (
      <div className="p-4 text-muted-foreground">
        유효하지 않은 패키지 데이터입니다.
      </div>
    );
  }
}
