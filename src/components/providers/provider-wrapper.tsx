"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import StaleTokenProvider from "./stale-token-provider";

export default function ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SessionProvider>
        <StaleTokenProvider>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </StaleTokenProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
