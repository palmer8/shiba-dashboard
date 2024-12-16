import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import PaymentSearchFilter from "@/components/payment/payment-search-filter";
import PaymentTable from "@/components/payment/payment-table";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { paymentService } from "@/service/payment-service";
import { PaymentFilter } from "@/types/filters/payment-filter";
import { PaymentDto } from "@/types/payment";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

interface SearchParams {
  page?: string;
  ip?: string;
  email?: string;
  price?: string;
  fromDate?: string;
  toDate?: string;
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/login");
  if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) return redirect("/");

  let data: PaymentDto = {
    items: [],
    total: 0,
    page: 0,
    totalPages: 0,
  };

  const params = await searchParams;

  const filter: PaymentFilter = {
    page: params.page ? parseInt(params.page) : 1,
    ip: params.ip,
    email: params.email,
    price: params.price ? parseInt(params.price) : undefined,
    ...(params.fromDate && params.toDate
      ? {
          date: [new Date(params.fromDate), new Date(params.toDate)],
        }
      : {}),
  };

  const result = await paymentService.getPayment(filter);

  if (result.success && result.data) {
    data = result.data;
  }

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="결제 조회"
        description="SHIBA의 결제 내역을 조회합니다."
      />
      <PaymentSearchFilter filter={filter} />
      {result.success ? (
        <PaymentTable data={data} />
      ) : (
        <div className="text-center text-red-500">{result.message}</div>
      )}
    </main>
  );
}
