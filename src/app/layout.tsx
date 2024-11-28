import type { Metadata } from "next";
import "./globals.css";
import ProviderWrapper from "@/components/providers/provider-wrapper";

export const metadata: Metadata = {
  title: "SHIBA | 어드민 대시보드",
  description: "SHIBA 어드민 대시보드에서 손쉽게 서비스를 관리하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
