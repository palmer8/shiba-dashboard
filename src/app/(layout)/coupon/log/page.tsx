import { CouponLogFilter } from "@/components/coupon/coupon-log-filter";
import { CouponLogTable } from "@/components/coupon/coupon-log-table";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import * as couponService from "@/service/coupon-service";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    userId?: string;
    couponCode?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function CouponLogPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  // 권한 체크 - STAFF 이상만 접근 가능
  if (!hasAccess(session.user.role, UserRole.STAFF)) {
    return redirect("/");
  }

  const params = await searchParams;

  // 검색 파라미터 처리
  const page = params.page ? parseInt(params.page) : 1;
  const filters = {
    userId: params.userId ? parseInt(params.userId) : undefined,
    couponCode: params.couponCode,
    startDate: params.startDate,
    endDate: params.endDate,
  };

  try {
    // 쿠폰 로그 데이터 조회
    const result = await couponService.getCouponLogs(page, filters);

    return (
      <main>
        <PageBreadcrumb />
        <GlobalTitle
          title="쿠폰 사용 조회"
          description="쿠폰을 사용한 로그를 조회할 수 있습니다."
        />
        <div className="space-y-4">
          <CouponLogFilter filters={filters} />
          <CouponLogTable data={result} />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Coupon log page error:", error);
    // 404로 리다이렉트하지 않고 에러 메시지 표시
    return (
      <main>
        <PageBreadcrumb />
        <GlobalTitle
          title="쿠폰 사용 조회"
          description="쿠폰을 사용한 로그를 조회할 수 있습니다."
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              데이터를 불러올 수 없습니다
            </h3>
            <p className="text-gray-500">
              잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      </main>
    );
  }
}
