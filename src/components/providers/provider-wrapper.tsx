"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";

export default function ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SidebarProvider>
        {children}
        <Toaster />
      </SidebarProvider>
    </SessionProvider>
  );
}
