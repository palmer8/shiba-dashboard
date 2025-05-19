"use client";

import {
  formatKoreanDateTime,
  formatRole,
  getFirstNonEmojiCharacter,
  isSameOrHigherRole,
  ROLE_HIERARCHY,
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
  resetUserPasswordAction,
  toggleDashboardUserPermissionAction,
  updateDashboardUserRoleAction,
} from "@/actions/admin-action";
import { UserRole } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import Empty from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import EditAdminDialog from "@/components/dialog/edit-admin-dialog";

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

export function AdminManagementTable({
  data,
  session,
}: AdminManagementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedAdmin, setSelectedAdmin] = useState<
    AdminDto["items"][number] | null
  >(null);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<
    AdminDto["items"][number] | null
  >(null);
  const [showEditAdminDialog, setShowEditAdminDialog] = useState(false);

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
        const roleAOrder = ROLE_HIERARCHY[a.role as UserRole] ?? 99;
        const roleBOrder = ROLE_HIERARCHY[b.role as UserRole] ?? 99;
        return sortDirection === "desc"
          ? roleBOrder - roleAOrder
          : roleAOrder - roleBOrder;
      }
      return 0;
    });

  const canManagePermissions = (
    sessionRole: UserRole,
    targetRole: UserRole
  ) => {
    if (sessionRole === "INGAME_ADMIN") {
      return targetRole === "STAFF"; // 인게임 관리자는 스태프만 관리 가능
    }
    return !isSameOrHigherRole(sessionRole, targetRole); // 기존 로직 유지
  };

  const canEditThisUser = (targetAdmin: AdminDto["items"][number]) => {
    if (!session.user || !session.user.role) return false;
    const currentUserRole = session.user.role as UserRole;
    const targetUserRole = targetAdmin.role as UserRole;

    if (ROLE_HIERARCHY[currentUserRole] < ROLE_HIERARCHY[UserRole.MASTER]) {
      return false;
    }

    if (currentUserRole === UserRole.SUPERMASTER) {
      return true;
    }

    if (session.user.id === targetAdmin.id) {
      return false;
    }

    if (ROLE_HIERARCHY[currentUserRole] <= ROLE_HIERARCHY[targetUserRole]) {
      return false;
    }

    return true;
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-4 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-[180px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
            defaultValue="ALL"
          >
            <SelectTrigger className="w-full sm:w-[100px]">
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
        <div className="flex items-center gap-2 self-end sm:self-auto">
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

      <div className="min-h-[50vh]">
        {filteredItems.length > 0 ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
                          {session.user.role === "INGAME_ADMIN" ? (
                            <div className="px-3 py-2 text-sm">
                              {formatRole(admin.role)}
                            </div>
                          ) : isSameOrHigherRole(
                              session.user.role,
                              admin.role
                            ) ? (
                            <div className="px-3 py-2 text-sm">
                              {formatRole(admin.role)}
                            </div>
                          ) : (
                            <Select
                              defaultValue={admin.role}
                              onValueChange={async (value) => {
                                await updateDashboardUserRoleAction(
                                  admin.id,
                                  value as UserRole
                                );
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="권한 변경" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.filter(
                                  (option) =>
                                    option.value !== "ALL" &&
                                    ROLE_HIERARCHY[option.value as UserRole] <
                                      ROLE_HIERARCHY[
                                        session.user?.role as UserRole
                                      ]
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
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAdminForEdit(admin);
                              setShowEditAdminDialog(true);
                            }}
                            disabled={!canEditThisUser(admin)}
                          >
                            유저 정보 변경
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
                              await toggleDashboardUserPermissionAction(
                                admin.id,
                                !admin.isPermissive
                              );
                              router.refresh();
                            }}
                            disabled={
                              (session.user.id === admin.id &&
                                session.user.role !== UserRole.SUPERMASTER) ||
                              !canManagePermissions(
                                session.user.role as UserRole,
                                admin.role as UserRole
                              )
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
                          {session.user.userId === 1 &&
                            session.user.role === "SUPERMASTER" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAdmin(admin);
                                  setShowResetPasswordDialog(true);
                                }}
                              >
                                비밀번호 재설정
                              </DropdownMenuItem>
                            )}
                          {session.user.userId === 1 &&
                            session.user.role === "SUPERMASTER" && (
                              <DropdownMenuSeparator />
                            )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                                disabled={
                                  session.user.id === admin.id ||
                                  (session.user.role !== UserRole.SUPERMASTER &&
                                    isSameOrHigherRole(
                                      session.user.role as UserRole,
                                      admin.role as UserRole
                                    ))
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
      </div>

      <AlertDialog
        open={showResetPasswordDialog}
        onOpenChange={setShowResetPasswordDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>비밀번호 재설정</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAdmin?.nickname} ({selectedAdmin?.userId})의 새로운
              비밀번호를 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setNewPassword("");
                setSelectedAdmin(null);
                setShowResetPasswordDialog(false);
              }}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!selectedAdmin) return;

                const result = await resetUserPasswordAction(
                  selectedAdmin.userId,
                  newPassword
                );

                if (result.success) {
                  toast.success("비밀번호가 재설정되었습니다.");
                } else {
                  toast.error(
                    result.error || "비밀번호 재설정에 실패했습니다."
                  );
                }

                setNewPassword("");
                setSelectedAdmin(null);
                setShowResetPasswordDialog(false);
              }}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedAdminForEdit && (
        <EditAdminDialog
          isOpen={showEditAdminDialog}
          onOpenChange={(open) => {
            setShowEditAdminDialog(open);
            if (!open) {
              setSelectedAdminForEdit(null);
            }
          }}
          targetUser={selectedAdminForEdit}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
