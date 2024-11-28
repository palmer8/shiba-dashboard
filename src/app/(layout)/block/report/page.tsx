import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function ReportPage() {
  const session = await auth();

  if (!session?.user) return redirect("/login");

  return (
    <div className="grid p-6 gap-12 w-full min-h-screen">
      <PageBreadcrumb />
    </div>
  );
}
