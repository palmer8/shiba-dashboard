import { AttendanceViewer } from "@/components/attendance/attendance-viewer";
import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { getAttendanceRecordsWithUsersAction } from "@/actions/realtime/realtime-action";
import { SimplifiedUser, AttendanceRecordWithUser } from "@/types/attendance";
import { unstable_noStore as noStore } from "next/cache";
import { realtimeService } from "@/service/realtime-service";
import { UserRole, ROLE_HIERARCHY } from "@/lib/utils";

interface AdminAttendancePageProps {
  searchParams: {
    startDate?: string;
    endDate?: string;
  };
}

export interface AttendancePageData {
  initialRecords: AttendanceRecordWithUser[];
  initialUsers: SimplifiedUser[];
  error?: string;
}

async function getAttendanceData(): Promise<AttendancePageData> {
  noStore(); // 데이터 캐싱 방지
  const result = await realtimeService.getAttendanceRecordsWithUser();

  if (!result.success || !result.data) {
    return {
      initialRecords: [],
      initialUsers: [],
      error: result.error || "근태 데이터를 가져오는데 실패했습니다.",
    };
  }

  // initialUsers 추출: result.data (AttendanceRecordWithUser[]) 에서 user 정보를 중복 없이 SimplifiedUser[] 형태로 만듭니다.
  const usersMap = new Map<string, SimplifiedUser>(); // user.id (UUID)를 키로 사용
  result.data.forEach((record) => {
    if (record.user && !usersMap.has(record.user.id)) {
      usersMap.set(record.user.id, {
        ...record.user,
      });
    }
  });
  let initialUsers = Array.from(usersMap.values());

  // 역할(role) 기준으로 내림차순 정렬
  initialUsers.sort((a, b) => {
    const roleA = ROLE_HIERARCHY[a.role as UserRole];
    const roleB = ROLE_HIERARCHY[b.role as UserRole];
    return roleB - roleA; // 내림차순
  });

  return {
    initialRecords: result.data,
    initialUsers: initialUsers,
  };
}

export default async function AdminAttendancePage() {
  const { initialRecords, initialUsers, error } = await getAttendanceData();

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="근태 관리"
        description="직원들의 근태 현황을 조회하고 관리합니다."
      />
      <AttendanceViewer
        initialRecords={initialRecords}
        initialUsers={initialUsers}
      />
    </main>
  );
}
