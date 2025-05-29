import { CouponFilter } from "@/types/coupon";
import { CouponTable } from "@/components/coupon/coupon-table";
import { CouponFilters } from "@/components/coupon/coupon-filter";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GlobalTitle } from "@/components/global/global-title";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import * as couponService from "@/service/coupon-service";
import { UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    name?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function CouponPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");
  if (!hasAccess(session.user.role, UserRole.SUPERMASTER))
    return redirect("/");

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 0;
  
  const filters: CouponFilter = {
    name: params.name,
    type: params.type as any,
    startDate: params.startDate,
    endDate: params.endDate,
    page,
  };

  try {
    const data = await couponService.getCouponList(page, filters);

    return (
      <main>
        <PageBreadcrumb />
        <GlobalTitle
          title="쿠폰 관리"
          description="게임 내 쿠폰을 생성하고 관리할 수 있습니다."
        />
        <div className="space-y-6">
          <CouponFilters filters={filters} />
          <CouponTable data={data} page={page} session={session} filters={filters} />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Coupon page error:", error);
    return (
      <main>
        <PageBreadcrumb />
        <GlobalTitle
          title="쿠폰 관리"
          description="게임 내 쿠폰을 생성하고 관리할 수 있습니다."
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
