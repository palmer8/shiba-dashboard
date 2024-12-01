import * as React from "react";
import { FileSearch, ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ADMIN_LINKS } from "@/constant/constant";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";
import Link from "next/link";

const ICONS: { [key: string]: LucideIcon } = {
  audit: FileSearch,
};

export function NavAdminLinks({ session }: { session: Session | null }) {
  //   const userRole = session?.user?.role || UserRole.STAFF;

  const userRole = UserRole.MASTER;

  const filteredLinks = Object.entries(ADMIN_LINKS).filter(([_, value]) =>
    value.role.includes(userRole)
  );

  if (filteredLinks.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>관리 메뉴</SidebarGroupLabel>
      <SidebarMenu>
        {filteredLinks.map(([key, item]) => (
          <Collapsible key={key} asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.name}>
                  {ICONS[key] && React.createElement(ICONS[key])}
                  <span>{item.name}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.routes
                    .filter((route) => route.role.includes(userRole))
                    .map((route) => (
                      <SidebarMenuSubItem key={route.href}>
                        <SidebarMenuSubButton asChild>
                          <Link href={route.href}>
                            <span className="text-muted-foreground">
                              {route.name}
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
