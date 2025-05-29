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
import {
  useState,
  useMemo,
  Fragment,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { GroupMailTableData, GroupMail } from "@/types/mail";
import { handleDownloadJson2CSV } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  deleteGroupMailReserveAction,
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
import { MoreHorizontal, Trash, Edit2, Plus, Download } from "lucide-react";
import EditGroupMailDialog from "@/components/dialog/edit-group-mail-dialog";
import Empty from "@/components/ui/empty";
import { Session } from "next-auth";
import { writeAdminLogAction } from "@/actions/log-action";

interface GroupMailTableProps {
  data: GroupMailTableData;
  session: Session;
}

export function GroupMailTable({ data, session }: GroupMailTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroupMail, setSelectedGroupMail] = useState<GroupMail | null>(
    null
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    rewards: false,
    content: false,
  });
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
        header: "제목",
        cell: ({ row }) => <div>{row.getValue("reason")}</div>,
      },
      {
        accessorKey: "content",
        header: "사유",
        cell: ({ row }) => (
          <div className="max-w-[400px] truncate">{row.getValue("content")}</div>
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
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedGroupMail(row.original);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>수정</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    if (confirm("정말로 이 항목을 삭제하시겠습니까?")) {
                      const result = await deleteGroupMailReserveAction(
                        parseInt(row.original.id)
                      );
                      if (result.success) {
                        toast({
                          title: "삭제 성공",
                          description: "해당 항목을 성공적으로 제거했습니다.",
                        });
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

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`/game/group-mail?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleDownloadCSV = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast({
        title: "선택된 항목 없음",
        description: "다운로드할 항목을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvData = selectedRows.map((row) => {
        const mail = row.original;
        return {
          ID: mail.id,
          제목: mail.reason,
          사유: mail.content,
          보상: JSON.stringify(mail.rewards),
          시작일: formatKoreanDateTime(mail.startDate),
          종료일: formatKoreanDateTime(mail.endDate),
          작성자: mail.registrant?.nickname || "알 수 없음",
          등록일: formatKoreanDateTime(mail.createdAt),
        };
      });

      handleDownloadJson2CSV({
        data: csvData,
        fileName: "단체우편",
      });

      toast({
        title: "다운로드 완료",
        description: "CSV 파일이 성공적으로 다운로드되었습니다.",
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "CSV 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 items-center">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownloadCSV}
          disabled={!table.getSelectedRowModel().rows.length}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          CSV 다운로드
        </Button>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          추가
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
      <AddGroupMailDialog open={open} setOpen={setOpen} />
      {selectedGroupMail && (
        <EditGroupMailDialog
          open={isEditDialogOpen}
          setOpen={setIsEditDialogOpen}
          groupMail={selectedGroupMail}
        />
      )}
    </div>
  );
}
