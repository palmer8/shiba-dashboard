"use client";

import {
  formatKoreanDateTime,
  formatRole,
  getFirstNonEmojiCharacter,
  isSameOrHigherRole,
} from "@/lib/utils";
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
import {
  Ban,
  CheckCircle,
  MoreHorizontal,
  Search,
  Trash,
  ChevronDown,
} from "lucide-react";
import {
  removeDashboardUserAction,
  toggleDashboardUserPermissionAction,
  updateDashboardUserRoleAction,
} from "@/actions/admin-action";
import { UserRole } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import Empty from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Session } from "next-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdminDto } from "@/types/user";

interface AdminManagementTableProps {
  data: AdminDto;
  session: Session;
}

const ROLE_OPTIONS = [
  { label: "전체", value: "ALL" },
  { label: "스태프", value: "STAFF" },
  { label: "인게임 관리자", value: "INGAME_ADMIN" },
  { label: "마스터", value: "MASTER" },
  { label: "슈퍼 마스터", value: "SUPERMASTER" },
];

const SORT_OPTIONS = [
  { label: "가입일", value: "createdAt" },
  { label: "이름", value: "nickname" },
  { label: "권한", value: "role" },
] as const;

export default function AdminManagementTable({
  data,
  session,
}: AdminManagementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const filteredItems = data.items
    .filter((item: AdminDto["items"][number]) => {
      const matchesSearch =
        !searchTerm ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nickname?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "ALL" || item.role === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a: AdminDto["items"][number], b: AdminDto["items"][number]) => {
      if (sortBy === "createdAt") {
        return sortDirection === "desc"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "nickname") {
        return sortDirection === "desc"
          ? b.nickname.localeCompare(a.nickname)
          : a.nickname.localeCompare(b.nickname);
      }
      if (sortBy === "role") {
        return sortDirection === "desc"
          ? b.role.localeCompare(a.role)
          : a.role.localeCompare(b.role);
      }
      return 0;
    });

  const handlePageChange = (newPage: number) => {
    const currentPage = Number(data.page);
    const totalPages = Number(data.totalPages);

    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));

    if (searchTerm) params.set("search", searchTerm);
    if (roleFilter !== "ALL") params.set("role", roleFilter);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortDirection !== "desc") params.set("sortDirection", sortDirection);

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-[180px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
            defaultValue="ALL"
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="권한" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[100px]">
                정렬
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    if (sortBy === option.value) {
                      setSortDirection(
                        sortDirection === "desc" ? "asc" : "desc"
                      );
                    } else {
                      setSortBy(option.value);
                      setSortDirection("desc");
                    }
                  }}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <span className="ml-auto">
                      {sortDirection === "desc" ? "↓" : "↑"}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-sm text-muted-foreground">
            {filteredItems.length}명
          </span>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((admin: AdminDto["items"][number]) => (
            <Card key={admin.id} className="relative">
              <CardContent className="p-3">
                <div className="absolute top-2 right-2 z-10">
                  {session.user && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <Select
                          defaultValue={admin.role}
                          onValueChange={async (value) => {
                            await updateDashboardUserRoleAction(
                              admin.id,
                              value as UserRole
                            );
                          }}
                          disabled={
                            session.user.userId !== 1 &&
                            isSameOrHigherRole(session.user.role, admin.role)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="권한 변경" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.filter(
                              (option) => option.value !== "ALL"
                            ).map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={async () => {
                            await toggleDashboardUserPermissionAction(
                              admin.id,
                              !admin.isPermissive
                            );
                          }}
                          disabled={
                            session.user.userId !== 1 &&
                            isSameOrHigherRole(session.user.role, admin.role)
                          }
                        >
                          {admin.isPermissive ? (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              <span>비활성화</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>활성화</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                              disabled={
                                session.user.userId !== 1 &&
                                isSameOrHigherRole(
                                  session.user.role,
                                  admin.role
                                )
                              }
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>탈퇴</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                정말 탈퇴시키시겠습니까?
                              </AlertDialogTitle>
                              <div className="text-sm grid gap-1">
                                {admin.nickname} ({admin.userId})
                              </div>
                              <AlertDialogDescription>
                                계정을 삭제하면 모든 데이터가 영구적으로
                                삭제되며 복구할 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  await removeDashboardUserAction(admin.id);
                                }}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                탈퇴
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={admin.image || undefined} />
                      <AvatarFallback>
                        {getFirstNonEmojiCharacter(admin.nickname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate text-sm">
                        {admin.nickname}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {admin.name}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        고유번호
                      </span>
                      <span className="truncate ml-2 text-xs">
                        {admin.userId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        권한
                      </span>
                      <span className="truncate ml-2 text-xs">
                        {formatRole(admin.role)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        상태
                      </span>
                      <span
                        className={cn(
                          "truncate ml-2 text-xs",
                          admin.isPermissive
                            ? "text-primary"
                            : "text-destructive"
                        )}
                      >
                        {admin.isPermissive ? "활성" : "비활성"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        가입일
                      </span>
                      <span className="truncate ml-2 text-xs">
                        {formatKoreanDateTime(admin.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <Empty description="데이터가 존재하지 않습니다." />
        </div>
      )}

      <div className="flex items-center justify-center gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(Number(data.page) - 1)}
          disabled={Number(data.page) <= 1}
        >
          이전
        </Button>
        <div className="flex items-center gap-1">
          <span className="text-xs font-normal">
            {data.page} / {data.totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(Number(data.page) + 1)}
          disabled={Number(data.page) >= Number(data.totalPages)}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
