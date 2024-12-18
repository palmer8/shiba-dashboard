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
import { useMemo, useState, useCallback, Fragment } from "react";
import { useSession } from "next-auth/react";
import { formatKoreanDateTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BoardCategory } from "@prisma/client";
import AddCategoryDialog from "../dialog/add-category-dialog";
import { deleteCategoryAction } from "@/actions/board-action";
import Editor from "@/components/editor/advanced-editor";
import EditCategoryDialog from "../dialog/edit-category-dialog";
import Empty from "@/components/ui/empty";

interface CategoryTableProps {
  data: BoardCategory[];
}

export default function CategoryTable({ data }: CategoryTableProps) {
  const { data: session } = useSession();
  const [columnVisibility, setColumnVisibility] = useState({
    id: false,
    template: false,
  });

  const columns: ColumnDef<any>[] = useMemo(
    () => [
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
        header: "템플릿",
        accessorKey: "template",
        cell: ({ row }) => <></>,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <AddCategoryDialog />
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
                    row.toggleExpanded();
                  }}
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
                          initialValue={row.original.template}
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
