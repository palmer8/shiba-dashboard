import type { Metadata } from "next";
import "./globals.css";
import ProviderWrapper from "@/components/providers/provider-wrapper";
import Loading from "./loading";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "SHIBA 대시보드",
  description: "SHIBA 대시보드를 통해서 손쉽게 SHIBA를 관리하세요.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body>
        <Suspense fallback={<Loading />}>
          <ProviderWrapper>{children}</ProviderWrapper>
        </Suspense>
      </body>
    </html>
  );
}
