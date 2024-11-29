"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/components/global/loading";

export default function ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SessionProvider>
        <SidebarProvider>
          {children}
          <Toaster />
        </SidebarProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
