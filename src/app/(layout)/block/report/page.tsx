import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { headers } from "next/headers";

export default async function ReportPage() {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  return (
    <div className="grid p-6 gap-12 w-full min-h-screen">
      <PageBreadcrumb pathname={pathname || "/"} />
    </div>
  );
}
