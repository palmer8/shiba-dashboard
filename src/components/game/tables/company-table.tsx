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
  formatKoreanNumber,
  handleDownloadJson2CSV,
  hasAccess,
  parseSearchParams,
} from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { MoreHorizontal, Edit2, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UpdateCompanyDialog from "@/components/dialog/update-company-dialog";
import { writeAdminLogAction } from "@/actions/log-action";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Session } from "next-auth";
import { useRouter, useSearchParams } from "next/navigation";

interface CompanyTableProps {
  data: {
    records: {
      id: number;
      name: string;
      capital: number;
    }[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
  session: Session;
}

export function CompanyTable({ data, session }: CompanyTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCompany, setSelectedCompany] = useState<{
    id: number;
    capital: number;
  } | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
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
      header: "이름",
      accessorKey: "name",
    },
    {
      header: "잔고",
      accessorKey: "capital",
      cell: ({ row }) =>
        row.original.capital
          ? formatKoreanNumber(row.original.capital) + "원"
          : "-",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const canModify = hasAccess(session?.user!.role, UserRole.SUPERMASTER);

        if (!canModify) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCompany({
                    id: row.original.id,
                    capital: row.original.capital,
                  });
                  setIsUpdateDialogOpen(true);
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                <span>잔고 수정</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
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
      ? ` (type=${decodedParams.type}&value=${decodedParams.value}&condition=${decodedParams.condition}&page=${decodedParams.page})`
      : "";

    await writeAdminLogAction(
      `팩션 공동 계좌 CSV 다운로드 ${searchParamsText}`
    );

    handleDownloadJson2CSV({
      data: selectedRows,
      fileName: "company_bank",
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
      {selectedCompany && (
        <UpdateCompanyDialog
          open={isUpdateDialogOpen}
          setOpen={setIsUpdateDialogOpen}
          companyId={selectedCompany.id}
          currentCapital={selectedCompany.capital}
        />
      )}
    </div>
  );
}
