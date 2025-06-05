import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import RealtimeUserWrapper from "@/components/realtime/user/realtime-user-wrapper";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { GlobalTitle } from "@/components/global/global-title";

export default async function RealtimeUserPage() {
  const session = await auth();

  if (!session?.user) return redirect("/login");
  if (!session.user.isPermissive) return redirect("/pending");

  const isAdmin = hasAccess(session.user.role, UserRole.INGAME_ADMIN);
  const isMaster = hasAccess(session.user.role, UserRole.MASTER);

  return (
    <main className="max-w-full w-full overflow-x-auto">
      <PageBreadcrumb />
      <GlobalTitle
        title="유저 정보"
        description="유저 정보 메뉴에서 고유번호를 통해 유저를 조회하고 관리하세요."
      />
      <RealtimeUserWrapper
        isAdmin={isAdmin}
        isMaster={isMaster}
        session={session}
      />
    </main>
  );
}
