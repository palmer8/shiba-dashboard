"use client";

import {
  getRealtimeUserGroupsAction,
  updateUserGroupByGroupMenuAction,
} from "@/actions/realtime/realtime-group-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { LoadingBar } from "@/components/global/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import AddGroupDialog from "@/components/dialog/add-group-dialog";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { handleDownloadJson2CSV } from "@/lib/utils";
import Empty from "@/components/ui/empty";

interface RealtimeGroupExpandedRowProps {
  userId: string;
}

interface GroupData {
  groupName: string;
  isSelected?: boolean;
}

export function RealtimeGroupExpandedRow({
  userId,
}: RealtimeGroupExpandedRowProps) {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<GroupData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="모두 선택"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="행 선택"
          />
        ),
      },
      {
        accessorKey: "groupName",
        header: "그룹명",
      },
      {
        id: "actions",
        header: "관리",
        cell: ({ row }) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const result = await updateUserGroupByGroupMenuAction({
                  user_id: Number(userId),
                  group: row.original.groupName,
                  action: "remove",
                });
                if (result.success) {
                  toast({
                    title: "그룹 추방 성공",
                  });
                  fetchUserGroups();
                } else {
                  toast({
                    title: "그룹 추방 실패",
                    description: result.error || "잠시 후 다시 시도해주세요",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                toast({
                  title: "그룹 추방 실패",
                  description: "잠시 후 다시 시도해주세요",
                  variant: "destructive",
                });
              }
            }}
          >
            추방
          </Button>
        ),
      },
    ],
    [userId]
  );

  const handleCSVDownload = () => {
    const selectedRows = table.getSelectedRowModel().rows;

    // 선택된 행들의 groupName만 추출하여 원본 데이터 형식으로 변환
    const selectedGroups = selectedRows.reduce((acc, row) => {
      acc[row.original.groupName] = true;
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

  async function fetchUserGroups() {
    try {
      setIsLoading(true);
      const result = await getRealtimeUserGroupsAction(Number(userId));
      if (result.success) {
        setData(result.data);
      } else {
        toast({
          title: "그룹 정보 조회 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "그룹 정보 조회 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUserGroups();
  }, [userId]);

  const groupsData = useMemo(() => {
    if (!data?.groups) return [];
    return Object.keys(data.groups).map((groupName) => ({
      groupName,
    }));
  }, [data?.groups]);

  const table = useReactTable({
    data: groupsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center">
        <LoadingBar />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Empty description="데이터를 불러올 수 없습니다" />
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/25">
      <Card>
        <CardHeader className="grid gap-2">
          <CardTitle className="text-lg">그룹 정보</CardTitle>
          <div className="flex justify-end items-center gap-2">
            <Button
              disabled={table.getSelectedRowModel().rows.length === 0}
              onClick={handleCSVDownload}
              size="sm"
            >
              CSV 다운로드
            </Button>
            <AddGroupDialog
              userId={Number(userId)}
              page="group"
              onSuccess={fetchUserGroups}
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <h3 className="font-semibold">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">고유번호</p>
                <p>{data.user_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">닉네임</p>
                <p>{data.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">직업</p>
                <p>{data.job}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold">소속 그룹</h3>
            {groupsData.length > 0 ? (
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
                  {table.getRowModel().rows.map((row) => (
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
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                소속된 그룹이 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
