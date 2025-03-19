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
import { useMemo, useState, useCallback } from "react";
import { EmojiTableData } from "@/types/emoji";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Empty from "@/components/ui/empty";
import {
  addEmojiToUserAction,
  removeEmojiFromUserAction,
} from "@/actions/emoji-action";
import { Plus, X, Search, MoreHorizontal, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmojiTableProps {
  data: EmojiTableData;
  session: any;
}

export function EmojiTable({ data, session }: EmojiTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [newEmoji, setNewEmoji] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterUserIdInput, setFilterUserIdInput] = useState("");
  const [filterEmojiInput, setFilterEmojiInput] = useState("");
  const [selectedEmojiForAdd, setSelectedEmojiForAdd] = useState<string>("");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserId, setNewUserId] = useState("");

  // 디바운스된 필터 값들
  const filterUserId = useDebounce(filterUserIdInput, 300);
  const filterEmoji = useDebounce(filterEmojiInput, 300);

  const hasManageAccess = hasAccess(session?.user?.role, UserRole.MASTER);

  const filteredData = useMemo(() => {
    if (!filterUserId && !filterEmoji) return data.records;

    return data.records.filter((item) => {
      const emojiMatch = filterEmoji ? item.emoji.includes(filterEmoji) : true;
      const userIdMatch = filterUserId
        ? item.users.some((user) => user.toString() === filterUserId)
        : true;

      return emojiMatch && userIdMatch;
    });
  }, [data.records, filterUserId, filterEmoji]);

  const handleAddEmoji = async () => {
    if (!newEmoji || !userId) {
      toast({
        title: "필수 정보 누락",
        description: "이모지와 사용자 ID를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await addEmojiToUserAction({
        userId: parseInt(userId),
        emoji: newEmoji,
      });

      if (result.success) {
        toast({
          title: "이모지 추가 완료",
          description: `사용자 ${userId}에게 이모지를 추가했습니다. 데이터가 업데이트되었습니다.`,
        });
        setIsAddDialogOpen(false);
        setNewEmoji("");
        setUserId("");
        // 페이지 새로고침
      } else {
        toast({
          title: "이모지 추가 실패",
          description: result.error || "이모지 추가 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "이모지 추가 실패",
        description: "이모지 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEmoji = async (userId: number, emoji: string) => {
    setIsLoading(true);
    try {
      const result = await removeEmojiFromUserAction({
        userId,
        emoji,
      });

      if (result.success) {
        toast({
          title: "이모지 제거 완료",
          description: `사용자 ${userId}의 이모지를 제거했습니다. 데이터가 업데이트되었습니다.`,
        });
      } else {
        toast({
          title: "이모지 제거 실패",
          description: result.error || "이모지 제거 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "이모지 제거 실패",
        description: "이모지 제거 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRemoveEmoji = () => {
    if (!selectedEmoji || !selectedUser) {
      toast({
        title: "제거할 이모지를 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    handleRemoveEmoji(selectedUser, selectedEmoji);
    setIsRemoveDialogOpen(false);
    setSelectedEmoji("");
    setSelectedUser(null);
  };

  const handleClearFilters = useCallback(() => {
    setFilterUserIdInput("");
    setFilterEmojiInput("");
  }, []);

  const handleAddUser = async () => {
    if (!newUserId || !selectedEmojiForAdd) {
      toast({
        title: "필수 정보 누락",
        description: "고유번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await addEmojiToUserAction({
        userId: parseInt(newUserId),
        emoji: selectedEmojiForAdd,
      });

      if (result.success) {
        toast({
          title: "고유번호 추가 완료",
          description: `사용자 ${newUserId}에게 이모지를 추가했습니다. 데이터가 업데이트되었습니다.`,
        });
        setAddUserDialogOpen(false);
        setNewUserId("");
        setSelectedEmojiForAdd("");
      } else {
        toast({
          title: "고유번호 추가 실패",
          description: result.error || "고유번호 추가 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "고유번호 추가 실패",
        description: "고유번호 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        {hasManageAccess && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            이모지 추가
          </Button>
        )}
      </div>

      {/* 필터 섹션 */}
      <div className="flex flex-wrap gap-4 p-3 rounded-md">
        <div className="flex flex-col gap-3 flex-1 min-w-[200px]">
          <Label htmlFor="filter-emoji">이모지</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="filter-emoji"
              placeholder="이모지로 검색"
              value={filterEmojiInput}
              onChange={(e) => setFilterEmojiInput(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-[200px]">
          <Label htmlFor="filter-userId">고유번호</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="filter-userId"
              placeholder="고유번호 입력"
              type="number"
              value={filterUserIdInput}
              onChange={(e) => setFilterUserIdInput(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!filterEmojiInput && !filterUserIdInput}
          >
            필터 초기화
          </Button>
        </div>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">No.</TableHead>
              <TableHead>이모지</TableHead>
              <TableHead>사용자 ID</TableHead>
              {hasManageAccess && <TableHead className="w-16"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={`${item.emoji}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="text-2xl">{item.emoji}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.users
                        .sort((a, b) => a - b)
                        .map((user) => (
                          <Badge
                            key={`${item.emoji}-${user}`}
                            variant="outline"
                            className="flex items-center gap-1 px-2 py-1 text-xs"
                          >
                            {user}
                            {hasManageAccess && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveEmoji(user, item.emoji);
                                }}
                                className="text-muted-foreground hover:text-destructive ml-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  {hasManageAccess && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEmojiForAdd(item.emoji);
                              setAddUserDialogOpen(true);
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>고유번호 추가</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={hasManageAccess ? 4 : 3}
                  className="h-24 text-center"
                >
                  <Empty
                    description={
                      filterUserId || filterEmoji
                        ? "검색 결과가 없습니다."
                        : "등록된 이모지가 없습니다."
                    }
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 이모지 추가 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이모지 추가</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="emoji">이모지</Label>
              <Input
                id="emoji"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="이모지를 입력하세요"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userId">사용자 ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="사용자 ID를 입력하세요"
                type="number"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddEmoji} disabled={isLoading}>
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 고유번호 추가 다이얼로그 */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>고유번호 추가</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">이모지:</span>
              <span className="text-2xl">{selectedEmojiForAdd}</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userId">고유번호</Label>
              <Input
                id="userId"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="고유번호를 입력하세요"
                type="number"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAddUserDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleAddUser} disabled={isLoading}>
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
