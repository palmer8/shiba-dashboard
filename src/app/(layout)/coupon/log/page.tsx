import { CouponLogFilter } from "@/components/coupon/coupon-log-filter";
import { CouponLogTable } from "@/components/coupon/coupon-log-table";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { couponService } from "@/service/coupon-service";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    userId?: string;
    nickname?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function CouponLogPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  const params = await searchParams;

  // 검색 파라미터 처리
  const page = params.page ? parseInt(params.page) : 1;
  const filters = {
    userId: params.userId ? parseInt(params.userId) : undefined,
    nickname: params.nickname,
    startDate: params.startDate,
    endDate: params.endDate,
  };

  // 쿠폰 로그 데이터 조회
  const result = await couponService.getCouponLogs(page, filters);

  if (!result.success || !result.data) {
    redirect("/404");
  }

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="쿠폰 사용 조회"
        description="쿠폰을 사용한 로그를 조회할 수 있습니다."
      />
      <div className="space-y-4">
        <CouponLogFilter filters={filters} />
        <CouponLogTable data={result.data} />
      </div>
    </main>
  );
}
