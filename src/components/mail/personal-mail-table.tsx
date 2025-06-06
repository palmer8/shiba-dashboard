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
// import { getPersonalMailsByIdsOrigin } from "@/actions/mail-action";
import { AddPersonalMailDialog } from "@/components/dialog/add-personal-mail-dialog";
import { PersonalMailDisplay, PersonalMailTableData } from "@/types/mail";
import { deletePersonalMailAction, createPersonalMailAction } from "@/actions/mail-action";
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
import Empty from "@/components/ui/empty";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { Session } from "next-auth";

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
    useState<PersonalMailDisplay | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    rewards: false,
    content: true,
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

  const columns = useMemo<ColumnDef<PersonalMailDisplay>[]>(
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
        accessorKey: "user_id",
        header: "고유번호",
        cell: ({ row }) => <div>{row.getValue("user_id")}</div>,
      },
      {
        accessorKey: "title",
        header: "제목",
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
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
        accessorKey: "used",
        header: "사용 여부",
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("used") ? (
              <span className="text-green-600 font-medium">사용됨</span>
            ) : (
              <span className="text-gray-500">미사용</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "reward_items",
        header: "보상",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {Object.entries(row.original.reward_items).map(([itemCode, itemInfo]) => 
              `${itemInfo.name}: ${itemInfo.amount}개`
            ).join(", ") || "없음"}
          </div>
        ),
      },
      {
        accessorKey: "nickname",
        header: "작성자",
        cell: ({ row }) => (
          <div>{row.original.nickname || "알 수 없음"}</div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "등록일",
        cell: ({ row }) => (
          <div>{formatKoreanDateTime(row.getValue("created_at"))}</div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const mail = row.original;
          // 개인 우편은 모든 관리자가 수정/삭제 가능
          const canModify = hasAccess(session?.user!.role, UserRole.STAFF);

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
                {hasAccess(session?.user!.role, UserRole.SUPERMASTER) && (
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
      router.push(`/game/mail?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "파일 형식 오류",
        description: "CSV 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "파일 형식 오류",
          description: "헤더와 최소 1개의 데이터 행이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      // CSV 헤더 확인 (user_id, title, content, need_items, reward_items, used)
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '')); // 따옴표 제거
      const requiredHeaders = ['user_id', 'title', 'content'];
      const optionalHeaders = ['need_items', 'reward_items', 'used', 'id', 'created_at']; // id, created_at도 허용
      const allValidHeaders = [...requiredHeaders, ...optionalHeaders];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast({
          title: "헤더 오류",
          description: `필수 헤더가 누락되었습니다: ${missingHeaders.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // 데이터 파싱
      const mailData: Array<{
        user_id: number;
        title: string;
        content: string;
        need_items: Record<string, number>;
        reward_items: Record<string, number>;
        used: boolean;
      }> = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, '')); // 따옴표 제거
        
        if (values.length < requiredHeaders.length) continue;

        const rowData: any = {};
        headers.forEach((header, index) => {
          if (allValidHeaders.includes(header)) {
            rowData[header] = values[index] || '';
          }
        });

        // JSON 파싱 처리
        let needItems: Record<string, number> = {};
        let rewardItems: Record<string, number> = {};

        try {
          if (rowData.need_items && rowData.need_items.trim() && rowData.need_items !== '{}') {
            // 이스케이프된 따옴표 처리
            let jsonStr = rowData.need_items.replace(/""/g, '"');
            const parsed = JSON.parse(jsonStr);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              needItems = parsed;
            }
          }
        } catch (e) {
          console.warn(`need_items JSON 파싱 오류 (행 ${i + 1}):`, rowData.need_items, e);
        }

        try {
          if (rowData.reward_items && rowData.reward_items.trim() && rowData.reward_items !== '{}') {
            // 이스케이프된 따옴표 처리
            let jsonStr = rowData.reward_items.replace(/""/g, '"');
            const parsed = JSON.parse(jsonStr);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              rewardItems = parsed;
            }
          }
        } catch (e) {
          console.warn(`reward_items JSON 파싱 오류 (행 ${i + 1}):`, rowData.reward_items, e);
        }

        const mailItem = {
          user_id: parseInt(rowData.user_id),
          title: rowData.title || '',
          content: rowData.content || '',
          need_items: needItems,
          reward_items: rewardItems,
          used: rowData.used === 'true' || rowData.used === '1' || parseInt(rowData.used) === 1,
        };

        mailData.push(mailItem);
      }

      // 개인 우편 생성 API 호출
      let successCount = 0;
      let errorCount = 0;

      for (const mail of mailData) {
        try {
          // need_items와 reward_items를 itemCode, count 형태로 변환
          const needItemsArray = Object.entries(mail.need_items).map(([itemCode, count]) => ({
            itemCode,
            count: typeof count === 'number' ? count : parseInt(String(count)) || 1,
          }));

          const rewardItemsArray = Object.entries(mail.reward_items).map(([itemCode, count]) => ({
            itemCode,
            count: typeof count === 'number' ? count : parseInt(String(count)) || 1,
          }));

          // 보상 아이템이 없는 경우 건너뛰기
          if (rewardItemsArray.length === 0) {
            console.warn(`보상 아이템이 없어서 건너뜀 (유저 ${mail.user_id})`);
            errorCount++;
            continue;
          }

          const apiData = {
            user_id: mail.user_id,
            title: mail.title,
            content: mail.content,
            used: mail.used,
            need_items: needItemsArray,
            reward_items: rewardItemsArray,
          };

          const result = await createPersonalMailAction(apiData);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`우편 생성 실패 (유저 ${mail.user_id}):`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`우편 생성 오류 (유저 ${mail.user_id}):`, error);
        }
      }

      toast({
        title: "CSV 업로드 완료",
        description: `성공: ${successCount}개, 실패: ${errorCount}개`,
      });

      // 파일 입력 초기화
      event.target.value = '';
      
    } catch (error) {
      toast({
        title: "파일 처리 오류",
        description: "CSV 파일 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("CSV 업로드 오류:", error);
    }
  };

  const handleCSVDownload = async () => {
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
        
        // need_items와 reward_items를 JSON 원본 형태로 변환 (아이템 이름 정보 제거)
        const needItemsOriginal: Record<string, number> = {};
        Object.entries(mail.need_items).forEach(([itemCode, itemInfo]) => {
          needItemsOriginal[itemCode] = typeof itemInfo === 'object' ? itemInfo.amount : itemInfo;
        });
        
        const rewardItemsOriginal: Record<string, number> = {};
        Object.entries(mail.reward_items).forEach(([itemCode, itemInfo]) => {
          rewardItemsOriginal[itemCode] = typeof itemInfo === 'object' ? itemInfo.amount : itemInfo;
        });
        
        return {
          id: mail.id,
          user_id: mail.user_id,
          title: mail.title,
          content: mail.content,
          need_items: JSON.stringify(needItemsOriginal),
          reward_items: JSON.stringify(rewardItemsOriginal),
          used: mail.used ? 1 : 0, // MySQL boolean 형태
          created_at: mail.created_at.toISOString().slice(0, 19).replace('T', ' '), // MySQL datetime 형태
        };
      });

      handleDownloadJson2CSV({
        data: csvData,
        fileName: "개인우편",
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
