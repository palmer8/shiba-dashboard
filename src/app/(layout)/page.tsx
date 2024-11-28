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
        description="SHIBA와 대시보드의 실시간 정보를 한 눈에 확인하세요."
      />
    </div>
  );
}
