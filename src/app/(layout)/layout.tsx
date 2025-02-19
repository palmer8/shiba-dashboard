import { LoadingOverlay } from "@/components/global/loading";
import MobileSheet from "@/components/global/mobile-sheet";
import { ShibaSidebar } from "@/components/global/shiba-sidebar";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ShibaSidebar />
      <MobileSheet />
      <Suspense fallback={<LoadingOverlay />}>
        <div className="w-screen h-screen max-w-full overflow-x-hidden">
          {children}
        </div>
      </Suspense>
    </>
  );
}
