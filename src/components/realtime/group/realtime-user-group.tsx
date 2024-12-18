"use client";

import { RealtimeGameUserData } from "@/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import AddGroupDialog from "@/components/dialog/add-group-dialog";
import { updateUserGroupAction } from "@/actions/realtime/realtime-group-action";
import { toast } from "@/hooks/use-toast";
import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatKoreanDateTime } from "@/lib/utils";
import { handleDownloadJson2CSV } from "@/lib/utils";

interface RealtimeUserGroupProps {
  data: RealtimeGameUserData;
  userId: number;
}

export default function RealtimeUserGroup({
  data,
  userId,
}: RealtimeUserGroupProps) {
  const groups = useMemo(
    () =>
      Object.entries(data.groups || {})
        .map(([key], index) => ({
          no: index + 1,
          name: key,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [data.groups]
  );

  async function handleRemoveGroup(groupName: string) {
    const result = await updateUserGroupAction({
      user_id: userId,
      group: groupName,
      action: "remove",
    });

    if (result.success) {
      toast({
        title: "해당 그룹에서 성공적으로 추방하였습니다.",
      });
    } else {
      toast({
        title: "그룹 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }

  const columns: ColumnDef<{ no: number; name: string }>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
      },
      {
        id: "no",
        header: "No.",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "name",
        header: "그룹 이름",
        cell: ({ row }) => row.original.name,
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="destructive"
            onClick={() => handleRemoveGroup(row.original.name)}
          >
            추방
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: groups,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCSVDownload = () => {
    const selectedRows = table.getSelectedRowModel().rows;

    // 선택된 행들의 name을 기반으로 원본 데이터 형식으로 변환
    const selectedGroups = selectedRows.reduce((acc, row) => {
      acc[row.original.name] = true;
      return acc;
    }, {} as Record<string, boolean>);

    // CSV를 위한 배열 변환
    const csvData = Object.entries(selectedGroups).map(
      ([groupName, value]) => ({
        group: groupName,
        status: value ? "true" : "false",
      })
    );

    handleDownloadJson2CSV({
      data: csvData,
      fileName: `${userId}'s-group.csv`,
    });

    toast({
      title: "그룹 목록 CSV 다운로드가 완료되었습니다.",
    });
  };

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold mt-2">
        {data.last_nickname}({userId})님의 그룹 목록
      </h1>
      <div className="flex justify-end gap-2 items-center">
        <Button
          disabled={table.getSelectedRowModel().rows.length === 0}
          onClick={handleCSVDownload}
          size="sm"
        >
          CSV 다운로드
        </Button>
        <AddGroupDialog userId={userId} page="user" />
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
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
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
    </div>
  );
}
