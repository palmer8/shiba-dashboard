"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import StaleTokenProvider from "./stale-token-provider";
import { Toaster as Sonner } from "@/components/ui/sonner";

export default function ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SessionProvider refetchOnWindowFocus={false}>
        <StaleTokenProvider>
          <SidebarProvider>
            {children}
            <Toaster />
            <Sonner />
          </SidebarProvider>
        </StaleTokenProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
