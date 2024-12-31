"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { NavLinks } from "@/components/global/nav-links";
import { NavAdminLinks } from "./nav-admin-links";
import { NavUser } from "./nav-user";
import { getUserByIdAction } from "@/actions/user-action";
import { User, UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";
import { useEffect } from "react";
import Link from "next/link";

export function ShibaSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const [user, setUser] = React.useState<Omit<
    User,
    "hashedPassword" | "isPermissive"
  > | null>(null);

  useEffect(() => {
    const getUser = async () => {
      if (!session || !session.user || !session.user.id) return;
      const result = await getUserByIdAction(session.user.id);
      if (result.success) {
        setUser(result.data);
      }
    };
    getUser();
  }, [session]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex justify-center items-center py-4">
        <Image
          priority
          src="/logo.webp"
          alt="logo"
          width={130}
          height={130}
          className="w-[130px] h-[130px]"
        />
      </div>
      <SidebarContent className="no-scrollbar">
        <NavLinks session={session} />
        {user && hasAccess(user?.role, UserRole.MASTER) && (
          <NavAdminLinks session={session} />
        )}
      </SidebarContent>
      <SidebarFooter>
        {session?.user && (
          <div className="grid gap-6">
            <Link
              href="https://docs.dokku.co.kr/shiba"
              target="_blank"
              className="pl-2 text-sm text-muted-foreground hover:underline"
            >
              SHIBA 문서 바로가기
            </Link>
            <NavUser session={session} />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
