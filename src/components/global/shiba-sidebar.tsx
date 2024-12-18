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

export function ShibaSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const [user, setUser] = React.useState<Omit<
    User,
    "hashedPassword" | "isPermissive"
  > | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const result = await getUserByIdAction(session?.user?.id || "");
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
        {session?.user && <NavUser session={session} />}
      </SidebarFooter>
    </Sidebar>
  );
}
