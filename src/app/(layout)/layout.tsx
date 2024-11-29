import MobileSheet from "@/components/global/mobile-sheet";
import { ShibaSidebar } from "@/components/global/shiba-sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ShibaSidebar />
      <MobileSheet />
      {children}
    </>
  );
}
