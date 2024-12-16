import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function CouponLogPage() {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="쿠폰 사용 조회"
        description="쿠폰을 사용한 로그를 조회할 수 있습니다."
      />
    </main>
  );
}
