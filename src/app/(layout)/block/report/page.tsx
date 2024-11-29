import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function ReportPage() {
  const session = await auth();

  if (!session?.user) return redirect("/login");

  return (
    <main>
      <PageBreadcrumb />
    </main>
  );
}
