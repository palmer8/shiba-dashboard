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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
        header: "관리",
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
    const csvData = selectedRows.map((row) => row.original);
    handleDownloadJson2CSV({
      data: csvData,
      fileName: `${formatKoreanDateTime(new Date())}-${userId}'s-group.csv`,
    });
  };

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <AddGroupDialog userId={userId} page="user" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>그룹 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button
              disabled={table.getSelectedRowModel().rows.length === 0}
              onClick={handleCSVDownload}
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    데이터가 존재하지 않습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
