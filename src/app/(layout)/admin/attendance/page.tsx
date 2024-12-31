import { AttendanceViewer } from "@/components/attendance/attendance-viewer";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { adminService } from "@/service/admin-service";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

interface AdminAttendancePageProps {
  searchParams: Promise<{
    startDate: string;
    endDate: string;
  }>;
}

export default async function AdminAttendancePage({
  searchParams,
}: AdminAttendancePageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");
  if (!hasAccess(session.user.role, UserRole.MASTER)) return redirect("/404");

  const params = await searchParams;

  const attendance = await adminService.getAttendanceAll(
    params.startDate,
    params.endDate
  );
  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="근태 관리"
        description="SHIBA 관리자들의 근태를 조회할 수 있습니다."
      />
      <AttendanceViewer attendances={attendance.data || []} />
    </main>
  );
}
