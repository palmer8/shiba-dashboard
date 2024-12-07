import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";

export default async function CouponLogPage() {
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
