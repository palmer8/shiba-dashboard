import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";

export default function AdminCategoryPage() {
  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="카테고리 관리"
        description="게시판 카테고리 및 각 카테고리에 따른 템플릿을 관리할 수 있습니다."
      />
    </main>
  );
}
