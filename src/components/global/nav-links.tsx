import * as React from "react";
import {
  LayoutDashboard,
  Clock,
  ScrollText,
  Gamepad2,
  CreditCard,
  Ticket,
  Shield,
  FileSearch,
  MoreHorizontal,
  type LucideIcon,
  ChevronRight,
} from "lucide-react";
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
import { ROLE_LINKS } from "@/constant/constant";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";
import Link from "next/link";

const ICONS: { [key: string]: LucideIcon } = {
  dashboard: LayoutDashboard,
  realtime: Clock,
  logs: ScrollText,
  game: Gamepad2,
  payment: CreditCard,
  coupon: Ticket,
  block: Shield,
  audit: FileSearch,
};

export function NavLinks({ session }: { session: Session | null }) {
  const userRole = session?.user?.role;
  const filteredLinks = Object.entries(ROLE_LINKS).filter(([_, value]) =>
    value.role.includes(userRole!)
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>메뉴</SidebarGroupLabel>
      <SidebarMenu>
        {filteredLinks.map(([key, item]) => (
          <Collapsible
            key={key}
            asChild
            defaultOpen={key === "dashboard"}
            className="group/collapsible"
          >
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
                    .filter((route) => route.role.includes(userRole!))
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
