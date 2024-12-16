import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AdminAttendancePage() {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");
  if (!hasAccess(session.user.role, UserRole.MASTER)) return redirect("/");

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="근태 관리"
        description="SHIBA 관리자들의 근태를 조회할 수 있습니다."
      />
    </main>
  );
}
