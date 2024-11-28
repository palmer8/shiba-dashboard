"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { NavLinks } from "@/components/global/nav-links";
import { NavAdminLinks } from "./nav-admin-links";

export function ShibaSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex justify-center items-center pt-2">
        <Image src="/logo.webp" alt="logo" width={150} height={100} />
      </div>
      <SidebarContent>
        <NavLinks session={session} />
        <NavAdminLinks session={session} />
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={{}} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
