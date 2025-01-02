"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Settings,
  Sun,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditUserDialog from "@/components/dialog/edit-user-dialog";
import { formatRole, getFirstNonEmojiCharacter } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavUserProps {
  session: Session;
}

export function NavUser({ session }: NavUserProps) {
  const { setTheme, theme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };

  const handleThemeChange = (e: React.MouseEvent) => {
    e.preventDefault();
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start gap-2 px-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user?.image || undefined} />
            <AvatarFallback>
              {getFirstNonEmojiCharacter(session.user?.nickname)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden text-left">
            <p className="truncate text-sm font-medium">
              {session.user?.nickname}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatRole(session.user?.role as UserRole)}
            </p>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src={session.user?.image || undefined} />
              <AvatarFallback>{session.user?.nickname?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-medium">{session.user?.nickname}</p>
              <p className="text-xs text-muted-foreground">
                {formatRole(session.user?.role as UserRole)}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <EditUserDialog
            session={session}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            trigger={
              <DropdownMenuItem
                className="gap-2 p-2"
                onSelect={(e) => {
                  e.preventDefault();
                  setDialogOpen(true);
                }}
              >
                <Settings className="h-4 w-4" />
                <span>계정 정보 수정</span>
              </DropdownMenuItem>
            }
          />
          <DropdownMenuItem className="gap-2 p-2" onClick={handleThemeChange}>
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span>{theme === "dark" ? "라이트 모드" : "다크 모드"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 p-2 text-red-500 focus:text-red-500"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
