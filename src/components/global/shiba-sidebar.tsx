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

export function ShibaSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex justify-center items-center pt-2">
        <Image
          priority
          src="/logo.webp"
          alt="logo"
          width={150}
          height={100}
          className="w-auto h-auto"
        />
      </div>
      <SidebarContent>
        <NavLinks session={session} />
        <NavAdminLinks session={session} />
      </SidebarContent>
      <SidebarFooter>
        {session?.user && <NavUser user={session.user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
