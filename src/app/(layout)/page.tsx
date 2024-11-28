import { GlobalTitle } from "@/components/global/global-title";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) return redirect("/login");

  return (
    <div className="grid p-6 gap-12 w-full min-h-screen">
      <GlobalTitle
        title="대시보드"
        description="SHIBA 대시보드에서 데이터들을 빠르게 확인하세요."
      />
    </div>
  );
}
