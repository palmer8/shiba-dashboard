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
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState, Fragment } from "react";
import { useSession } from "next-auth/react";
import {
  formatKoreanDateTime,
  formatRole,
  handleDownloadJson2CSV,
  cn,
} from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BoardCategory, UserRole } from "@prisma/client";
import AddCategoryDialog from "@/components/dialog/add-category-dialog";
import {
  deleteCategoryAction,
  getCategoryListByIdsOriginAction,
} from "@/actions/board-action";
import Editor from "@/components/editor/advanced-editor";
import EditCategoryDialog from "@/components/dialog/edit-category-dialog";
import Empty from "@/components/ui/empty";
import { Checkbox } from "@/components/ui/checkbox";
import { JSONContent } from "novel";
import { Badge } from "@/components/ui/badge";
import { useDragSelect } from "@/hooks/use-drag-select";

interface CategoryTableProps {
  data: BoardCategory[];
}

// 권한별 스타일 상수 추가
const ROLE_STYLES = {
  STAFF: "bg-blue-100 text-blue-800 border-blue-200",
  INGAME_ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  MASTER: "bg-amber-100 text-amber-800 border-amber-200",
} as const;

// 권한 레이블 상수 추가
const ROLE_LABELS = {
  STAFF: "스태프",
  INGAME_ADMIN: "인게임 관리자",
  MASTER: "마스터",
} as const;

export default function CategoryTable({ data }: CategoryTableProps) {
  const { data: session } = useSession();
  const [columnVisibility, setColumnVisibility] = useState({
    id: false,
    template: false,
  });

  const columns: ColumnDef<BoardCategory>[] = useMemo(
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
        header: "id",
        accessorKey: "id",
        cell: ({ row }) => row.original.id,
      },
      {
        header: "카테고리 이름",
        accessorKey: "name",
        cell: ({ row }) => row.original.name,
      },
      {
        header: "권한",
        accessorKey: "roles",
        cell: ({ row }) => {
          const roles = row.original.roles as UserRole[];

          // roles가 null이거나 빈 배열인 경우
          if (!roles || roles.length === 0) {
            return (
              <Badge variant="outline" className="bg-red-50 text-red-800">
                권한 없음
              </Badge>
            );
          }

          // 일반 권한들 표시 (SUPERMASTER 제외)
          return (
            <div className="flex flex-wrap gap-1">
              {roles
                .filter((role) => role !== "SUPERMASTER")
                .map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className={cn("border font-medium", ROLE_STYLES[role])}
                  >
                    {ROLE_LABELS[role]}
                  </Badge>
                ))}
            </div>
          );
        },
      },
      {
        header: "템플릿",
        accessorKey: "template",
        cell: ({ row }) => <></>,
      },
      {
        header: "사용 여부",
        accessorKey: "isUsed",
        cell: ({ row }) => (
          <Badge variant={row.original.isUsed ? "default" : "outline"}>
            {row.original.isUsed ? "사용" : "미사용"}
          </Badge>
        ),
      },
      {
        header: "생성일",
        accessorKey: "createdAt",
        cell: ({ row }) => formatKoreanDateTime(row.original.createdAt),
      },
      ...(session?.user?.role === "SUPERMASTER"
        ? [
            {
              id: "actions",
              header: "관리",
              cell: ({ row }: { row: Row<BoardCategory> }) => {
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditCategoryDialog
                        initialData={{
                          id: row.original.id,
                          name: row.original.name,
                          isUsed: row.original.isUsed,
                          roles: row.original.roles as UserRole[],
                          template: row.original.template,
                        }}
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
                          if (
                            confirm(
                              "정말로 카테고리를 삭제하시겠습니까?\n해당 카테고리를 사용하는 게시글도 전부 삭제됩니다."
                            )
                          ) {
                            const result = await deleteCategoryAction(
                              row.original.id
                            );
                            if (result.success) {
                              toast({
                                title: "해당 카테고리가 삭제되었습니다.",
                              });
                            } else {
                              toast({
                                title: "카테고리 삭제하는데 실패했습니다.",
                                description:
                                  result.error || "잠시 후에 다시 시도해주세요",
                                variant: "destructive",
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
          ]
        : []),
    ],
    [session]
  );

  const memorizedData = useMemo(() => data, [data]);

  const table = useReactTable({
    data: memorizedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
  });
  const { tableProps, getRowProps } = useDragSelect(table);

  const handleDownloadCSV = async () => {
    const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
    const result = await getCategoryListByIdsOriginAction(ids);
    if (result.success) {
      toast({
        title: "카테고리 목록 CSV 파일을 다운로드하였습니다.",
      });
      handleDownloadJson2CSV({
        data: result.data || [],
        fileName: "category_list.csv",
      });
    } else {
      toast({
        title: "카테고리 목록 CSV 파일을 다운로드 실패하였습니다.",
        description: result.error || "잠시 후에 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          disabled={table.getSelectedRowModel().rows.length === 0}
          onClick={handleDownloadCSV}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          CSV 다운로드
        </Button>
        <AddCategoryDialog />
      </div>
      <Table {...tableProps}>
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
              <Fragment key={row.id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => {
                    if (
                      e.target instanceof Element &&
                      (e.target.closest('[role="dialog"]') ||
                        e.target.closest('[role="menuitem"]'))
                    ) {
                      return;
                    }
                    if (
                      row.original.template &&
                      Object.keys(row.original.template).length > 0
                    ) {
                      row.toggleExpanded();
                    }
                  }}
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
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="bg-muted/30">
                      <div className="p-2">
                        <Editor
                          initialValue={row.original.template as JSONContent}
                          editable={false}
                        />
                      </div>
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
    </div>
  );
}
