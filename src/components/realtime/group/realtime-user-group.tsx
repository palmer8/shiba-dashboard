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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Session } from "next-auth";

interface RealtimeUserGroupProps {
  data: RealtimeGameUserData;
  userId: number;
  session: Session;
  mutate: () => Promise<any>;
}

export default function RealtimeUserGroup({
  data,
  userId,
  session,
  mutate,
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
        title: "그룹 추방 성공",
      });
      await mutate();
    } else {
      toast({
        title: "그룹 추방 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
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
      title: "CSV 다운로드 성공",
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>그룹 관리</CardTitle>
            <CardDescription>
              {data.last_nickname}({userId})님이 소속된 그룹 목록입니다.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="h-7">
            총 {groups.length}개 그룹
          </Badge>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={table.getSelectedRowModel().rows.length === 0}
            onClick={handleCSVDownload}
            className="h-8"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV 내보내기
          </Button>
          <AddGroupDialog userId={userId} page="user" mutate={mutate} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
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
                <TableRow
                  key={row.id}
                  className={row.getIsSelected() ? "bg-muted/50" : undefined}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  소속된 그룹이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
