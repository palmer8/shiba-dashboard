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

interface RealtimeUserGroupProps {
  data: RealtimeGameUserData;
  userId: number;
}

export default function RealtimeUserGroup({
  data,
  userId,
}: RealtimeUserGroupProps) {
  const groups = Object.entries(data.groups || {})
    .map(([key], index) => ({
      no: index + 1,
      name: key,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

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

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <AddGroupDialog userId={userId} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>그룹 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>그룹 이름</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.name}>
                  <TableCell>{group.no}</TableCell>
                  <TableCell>{group.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveGroup(group.name)}
                    >
                      추방
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
