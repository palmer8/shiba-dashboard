"use client";

import {
  getRealtimeUserGroupsAction,
  updateUserGroupByGroupMenuAction,
} from "@/actions/realtime/realtime-group-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
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

interface RealtimeGroupExpandedRowProps {
  userId: string;
}

export function RealtimeGroupExpandedRow({
  userId,
}: RealtimeGroupExpandedRowProps) {
  const [data, setData] = useState<Record<string, boolean> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchUserGroups() {
    try {
      setIsLoading(true);
      const result = await getRealtimeUserGroupsAction(Number(userId));
      if (result.success) {
        setData(result.data);
      } else {
        toast({
          title: "그룹 정보 조회 실패",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
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
        데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/25">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">그룹 정보</CardTitle>
          <AddGroupDialog
            userId={Number(userId)}
            page="group"
            onSuccess={fetchUserGroups}
          />
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
            {data.groups && Object.keys(data.groups).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>그룹명</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(data.groups).map(([groupName]) => (
                    <TableRow key={groupName}>
                      <TableCell>{groupName}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            try {
                              const result =
                                await updateUserGroupByGroupMenuAction({
                                  user_id: Number(userId),
                                  group: groupName,
                                  action: "remove",
                                });
                              if (result.success) {
                                toast({
                                  title:
                                    "해당 그룹에서 성공적으로 추방하였습니다.",
                                });
                                fetchUserGroups();
                              } else {
                                toast({
                                  title: "그룹 삭제에 실패하였습니다",
                                  description: result.message,
                                  variant: "destructive",
                                });
                              }
                            } catch (error) {
                              toast({
                                title: "그룹 제거 실패",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          제거
                        </Button>
                      </TableCell>
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
