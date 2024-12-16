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
  Row,
} from "@tanstack/react-table";
import { useState, useMemo, useCallback, Fragment } from "react";
import { GroupMailTableData, GroupMail } from "@/types/mail";
import { useSession } from "next-auth/react";
import { handleDownloadJson2CSV } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  deleteGroupMailAction,
  getGroupMailsByIdsOrigin,
} from "@/actions/mail-action";
import { AddGroupMailDialog } from "@/components/dialog/add-group-mail-dialog";
import { ExpandedGroupMailRow } from "@/components/mail/expanded-group-mail-row";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Pencil } from "lucide-react";
import EditGroupMailDialog from "@/components/dialog/edit-group-mail-dialog";

interface GroupMailTableProps {
  data: GroupMailTableData;
}

export function GroupMailTable({ data }: GroupMailTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isSuperMaster = session?.user?.role === "SUPERMASTER";
  const [open, setOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    rewards: false,
    content: false,
  });

  const columns = useMemo<ColumnDef<GroupMail>[]>(
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
        accessorKey: "reason",
        header: "사유",
        cell: ({ row }) => <div>{row.getValue("reason")}</div>,
      },
      {
        accessorKey: "content",
        header: "내용",
        cell: ({ row }) => (
          <div className="max-w-[400px] truncate">{row.getValue("reason")}</div>
        ),
      },
      {
        accessorKey: "rewards",
        header: "보상",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {JSON.stringify(row.getValue("rewards"))}
          </div>
        ),
      },
      {
        accessorKey: "startDate",
        header: "시작일",
        cell: ({ row }) => (
          <div>{formatKoreanDateTime(row.getValue("startDate"))}</div>
        ),
      },
      {
        accessorKey: "endDate",
        header: "종료일",
        cell: ({ row }) => (
          <div>{formatKoreanDateTime(row.getValue("endDate"))}</div>
        ),
      },
      {
        accessorKey: "nickname",
        header: "작성자",
        cell: ({ row }) => (
          <div>{row.original.registrant?.nickname || "알 수 없음"}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "등록일",
        cell: ({ row }) => (
          <div>{formatKoreanDateTime(row.getValue("createdAt"))}</div>
        ),
      },
      ...(isSuperMaster
        ? [
            {
              id: "actions",
              header: "관리",
              cell: ({ row }: { row: Row<GroupMail> }) => {
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[160px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EditGroupMailDialog
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
                        onClick={async () => {
                          if (confirm("정말로 이 항목을 삭제하시겠습니까?")) {
                            const result = await deleteGroupMailAction(
                              row.original.id
                            );
                            if (result && result.success) {
                              toast({ title: result.message });
                            }
                          }
                        }}
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
    [session]
  );

  const memorizedData = useMemo(() => data.records, [data.records]);

  const table = useReactTable({
    data: memorizedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getRowCanExpand: () => true,
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDownloadCSV = useCallback(async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (!selectedRows.length) return;

    const selectedIds = selectedRows.map((row) => row.original.id);
    const result = await getGroupMailsByIdsOrigin(selectedIds);
    if (result.success && result.data) {
      handleDownloadJson2CSV({
        data: result.data,
        fileName: `${formatKoreanDateTime(new Date())}-group-mail-list.csv`,
      });
    }
  }, [table]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 items-center">
        <AddGroupMailDialog open={open} setOpen={setOpen} />
        <Button
          onClick={handleDownloadCSV}
          disabled={!table.getSelectedRowModel().rows.length}
        >
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  onClick={() => row.toggleExpanded()}
                  className="cursor-pointer hover:bg-muted/50"
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
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="p-0">
                      <ExpandedGroupMailRow row={row.original} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                데이터가 존재하지 않습니다.
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
              value={data.metadata.page}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page > 0 && page <= data.metadata.totalPages) {
                  handlePageChange(page);
                }
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
