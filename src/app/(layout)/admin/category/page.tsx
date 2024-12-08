import CategoryTable from "@/components/boards/category-table";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { boardService } from "@/service/board-service";

export default async function AdminCategoryPage() {
  const data = await boardService.getCategoryList();
  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="카테고리 관리"
        description="게시판 카테고리 및 각 카테고리에 따른 템플릿을 관리할 수 있습니다."
      />
      <CategoryTable data={data.data || []} />
    </main>
  );
}
