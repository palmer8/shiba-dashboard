import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { RecipeLogTable } from "@/components/game/recipe-log-table";
import { auth } from "@/lib/auth-config";
import { logService } from "@/service/log-service";
import { RecipeLogFilter } from "@/types/log";
import { redirect } from "next/navigation";
import Empty from "@/components/ui/empty";
import { RecipeLogFilters } from "@/components/game/recipe-log-filters";

export default async function RecipeLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (!session.user.isPermissive) return redirect("/pending");

  const params = await searchParams;

  const filters: RecipeLogFilter = {
    page: params.page ? Number(params.page) : 1,
    userId: params.userId as string,
    recipeId: params.recipeId as string,
    rewardItem: params.rewardItem as string,
    startDate: params.startDate as string,
    endDate: params.endDate as string,
  };

  const result = await logService.getRecipeLogs(filters);
  const data = result.success
    ? result.data
    : {
        records: [],
        total: 0,
        page: 1,
        totalPages: 1,
        pageSize: 50,
      };

  return (
    <main className="space-y-4">
      <PageBreadcrumb />
      <GlobalTitle
        title="레시피 로그"
        description="유저들의 레시피 제작 내역을 조회할 수 있습니다."
      />
      <RecipeLogFilters filters={filters} />
      {data && data.records.length > 0 ? (
        <RecipeLogTable data={data} />
      ) : (
        <Empty description="레시피 로그가 없습니다." />
      )}
    </main>
  );
}
