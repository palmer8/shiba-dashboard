import { CouponFilter } from "@/types/coupon";
import { CouponTable } from "@/components/coupon/coupon-table";
import { CouponFilters } from "@/components/coupon/coupon-filter";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { GlobalTitle } from "@/components/global/global-title";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { couponService } from "@/service/coupon-service";
import { CouponGroupStatus, CouponGroupType, UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
    groupStatus?: string;
    groupType?: string;
    groupReason?: string;
  }>;
}

export default async function CouponPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");
  if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) return redirect("/");

  const params = await searchParams;

  const filters: CouponFilter = {
    startDate: params.startDate,
    endDate: params.endDate,
    groupStatus: params.groupStatus as CouponGroupStatus,
    groupType: params.groupType as CouponGroupType | "ALL",
    groupReason: params.groupReason,
  };

  const page = Number(params.page) || 0;
  const data = await couponService.getCouponGroupList(page, filters);

  return (
    <main>
      <PageBreadcrumb />
      <div className="flex justify-between items-center">
        <GlobalTitle
          title="쿠폰 관리"
          description="쿠폰 그룹을 통해 쿠폰을 발급하고, 관리할 수 있습니다."
        />
      </div>
      <CouponFilters filters={filters} />
      <CouponTable
        data={
          data.data || {
            couponGroups: [],
            metadata: {
              currentPage: 0,
              totalPages: 0,
              totalCount: 0,
            },
          }
        }
        page={page}
      />
    </main>
  );
}
