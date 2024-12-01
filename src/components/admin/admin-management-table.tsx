"use client";

import { AdminUser } from "@/types/user";
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
import { useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatKoreanDateTime, formatRole } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, CheckCircle, MoreHorizontal, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  removeDashboardUserAction,
  toggleDashboardUserPermissionAction,
  updateDashboardUserRoleAction,
} from "@/actions/admin-action";
import { UserRole } from "@prisma/client";
import { AdminDto } from "@/dto/admin.dto";
import { useRouter, useSearchParams } from "next/navigation";

interface AdminManagementTableProps {
  data: AdminDto;
}

export default function AdminManagementTable({
  data,
}: AdminManagementTableProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    id: false,
  });

  const columns: ColumnDef<AdminUser>[] = useMemo(
    () => [
      {
        header: "id",
        accessorKey: "id",
        cell: ({ row }) => {
          return <div>{row.original.id}</div>;
        },
      },
      {
        header: "고유번호",
        accessorKey: "userId",
        cell: ({ row }) => {
          return <div>{row.original.userId}</div>;
        },
      },
      {
        header: "아이디",
        accessorKey: "name",
        cell: ({ row }) => {
          return <div>{row.original.name}</div>;
        },
      },
      {
        header: "이름",
        accessorKey: "nickname",
        cell: ({ row }) => {
          return <div>{row.original.nickname}</div>;
        },
      },
      {
        accessorKey: "role",
        header: "권한",
        cell: ({ row }) => {
          const isSuperMaster = session?.user?.role === "SUPERMASTER";
          const isCurrentUser = session?.user?.id === row.original.id;

          if (!isSuperMaster || isCurrentUser) {
            return (
              <div className="font-medium">
                {formatRole(row.getValue("role"))}
              </div>
            );
          }

          return (
            <Select
              defaultValue={row.getValue("role")}
              onValueChange={async (value) => {
                await updateDashboardUserRoleAction(
                  row.original.id,
                  value as UserRole
                );
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">스태프</SelectItem>
                <SelectItem value="INGAME_ADMIN">인게임 관리자</SelectItem>
                <SelectItem value="MASTER">마스터</SelectItem>
                <SelectItem value="SUPERMASTER">슈퍼 마스터</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "isPermissive",
        header: "상태",
        cell: ({ row }) => (
          <div
            className={cn(
              "font-medium",
              row.getValue("isPermissive") ? "text-green-600" : "text-red-600"
            )}
          >
            {row.getValue("isPermissive") ? "활성" : "비활성"}
          </div>
        ),
      },
      {
        header: "생성일",
        accessorKey: "createdAt",
        cell: ({ row }) => {
          return <div>{formatKoreanDateTime(row.original.createdAt)}</div>;
        },
      },
      ...(session?.user?.role === "SUPERMASTER"
        ? [
            {
              id: "actions",
              header: "관리",
              cell: ({ row }: { row: Row<AdminUser> }) => {
                const isCurrentUser = session?.user?.id === row.original.id;

                if (isCurrentUser) {
                  return null;
                }

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        onClick={async () => {
                          await toggleDashboardUserPermissionAction(
                            row.original.id,
                            !row.original.isPermissive
                          );
                        }}
                      >
                        {row.original.isPermissive ? (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            <span>계정 비활성화</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>계정 활성화</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={async () => {
                          if (confirm("정말로 이 계정을 탈퇴시키겠습니까?")) {
                            await removeDashboardUserAction(row.original.id);
                          }
                        }}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>탈퇴</span>
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

  const table = useReactTable({
    data: data.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <TableHead key={column.id}>
                  {column.isPlaceholder
                    ? null
                    : flexRender(
                        column.column.columnDef.header,
                        column.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
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
          총 {data.total}개 중 {(data.page - 1) * 10 + 1}-
          {Math.min(data.page * 10, data.total)}개 표시
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
              value={data.page}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page > 0 && page <= data.totalPages) {
                  handlePageChange(page);
                }
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
    </div>
  );
}
