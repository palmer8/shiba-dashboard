import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { ItemsSearchTable } from "@/components/game/items-search-table";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";

export default async function ItemListPage() {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (!session.user.isPermissive) return redirect("/pending");

  if (!hasAccess(session.user.role, UserRole.MASTER)) {
    return redirect("/404");
  }

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="아이템 목록"
        description="아이템 이름이나 코드로 검색하여 아이템을 찾고 코드를 복사할 수 있습니다."
      />
      <ItemsSearchTable />
    </main>
  );
}