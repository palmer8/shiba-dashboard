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
import { formatKoreanDateTime, handleDownloadJson2CSV } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import {
  useState,
  useMemo,
  Fragment,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { getPersonalMailsByIdsOrigin } from "@/actions/mail-action";
import { AddPersonalMailDialog } from "@/components/dialog/add-personal-mail-dialog";
import { PersonalMail, PersonalMailTableData } from "@/types/mail";
import { deletePersonalMailAction } from "@/actions/mail-action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Download, Plus, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ExpandedMailRow } from "@/components/mail/expanded-mail-row";
import EditPersonalMailDialog from "@/components/dialog/edit-personal-mail-dialog";
import { Input } from "@/components/ui/input";
import { uploadPersonalMailCSVAction } from "@/actions/mail-action";
import Empty from "@/components/ui/empty";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { Session } from "next-auth";
import { writeAdminLogAction } from "@/actions/log-action";

interface PersonalMailTableProps {
  data: PersonalMailTableData;
  session: Session;
}

export function PersonalMailTable({ data, session }: PersonalMailTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPersonalMail, setSelectedPersonalMail] =
    useState<PersonalMail | null>(null);
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

  const columns = useMemo<ColumnDef<PersonalMail>[]>(
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
        accessorKey: "userId",
        header: "고유번호",
        cell: ({ row }) => <div>{row.getValue("userId")}</div>,
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
          <div className="max-w-[400px] truncate">
            {row.getValue("content")}
          </div>
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
          const mail = row.original;
          const canModify =
            mail.registrantId === session?.user?.id ||
            hasAccess(session?.user?.role, UserRole.SUPERMASTER);

          if (!canModify) return null;

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
                    setSelectedPersonalMail(row.original);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>수정</span>
                </DropdownMenuItem>
                {hasAccess(session?.user?.role, UserRole.SUPERMASTER) && (
                  <DropdownMenuItem
                    onClick={async () => {
                      if (confirm("정말로 이 항목을 삭제하시겠습니까?")) {
                        const result = await deletePersonalMailAction(
                          row.original.id
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
                )}
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
      router.push(`/mail/personal?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadPersonalMailCSVAction(formData);

      if (result.success && result.data) {
        await writeAdminLogAction(`개인 우편 CSV 업로드`);
        toast({
          title: "CSV 업로드 성공",
          description: `${result.data.count}개의 개인 우편이 생성되었습니다.`,
        });
      } else {
        toast({
          title: "CSV 업로드 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "CSV 업로드 실패",
        description: "파일 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCSVDownload = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const csvData = await getPersonalMailsByIdsOrigin(
      selectedRows.map((row) => row.original.id)
    );
    if (csvData.success) {
      handleDownloadJson2CSV({
        data: csvData.data || [],
        fileName: `personal_mails.csv`,
      });
      await writeAdminLogAction(
        `개인 우편 CSV 다운로드 : ${selectedRows
          .map((row) => row.original.content)
          .join(", ")}`
      );
      toast({
        title: "CSV 다운로드 성공",
        description: "해당 항목을 성공적으로 제거했습니다.",
      });
    } else {
      toast({
        title: "CSV 다운로드 실패",
        description: csvData.error || "잠시 후에 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              handleCSVDownload();
            }}
            disabled={!table.getSelectedRowModel().rows.length}
          >
            <Download className="h-4 w-4" />
            CSV 다운로드
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              CSV 업로드
            </Button>
          </div>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>
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
                      <ExpandedMailRow row={row.original} />
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
      <AddPersonalMailDialog open={open} setOpen={setOpen} />
      {selectedPersonalMail && (
        <EditPersonalMailDialog
          open={isEditDialogOpen}
          setOpen={setIsEditDialogOpen}
          personalMail={selectedPersonalMail}
        />
      )}
    </div>
  );
}
