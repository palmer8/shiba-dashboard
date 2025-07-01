import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { UserPartitionLogTable } from "@/components/game/user-partition-log-table";
import UserPartitionLogFilter from "@/components/game/user-partition-log-filter";
import { newLogService } from "@/service/log-service";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
    level?: string;
    startDate?: string;
    endDate?: string;
    message?: string;
    limit?: string;
  }>;
}

export default async function UserPartitionLogPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  const params = await searchParams;

  const filters = {
    page: Number(params.page) || 1,
    type: params.type,
    level: params.level,
    startDate: params.startDate,
    endDate: params.endDate,
    message: params.message || undefined,
    limit: Number(params.limit) || 50,
  };

  const result = await newLogService.getPartitionLogs(filters);

  const defaultLogData = {
    records: [],
    total: 0,
    page: 1,
    totalPages: 1,
    memoryLogs: 0,
    databaseLogs: 0,
    bufferSize: 0,
  };

  const logData = result.success ? result.data! : defaultLogData;

  const metadata = {
    currentPage: logData.page,
    totalPages: logData.totalPages,
    totalCount: logData.total,
    memoryLogs: logData.memoryLogs,
    databaseLogs: logData.databaseLogs,
    bufferSize: logData.bufferSize,
  };

  const filterMetadata = {
    memoryLogs: logData.memoryLogs,
    databaseLogs: logData.databaseLogs,
    bufferSize: logData.bufferSize,
  };

  return (
    <main className="space-y-6">
      <PageBreadcrumb />
      <GlobalTitle
        title="유저 로그"
        description="실시간으로 SHIBA의 유저 로그를 확인할 수 있습니다."
      />
      
      {!result.success && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h4 className="font-medium text-red-800">서버 연결 오류</h4>
          <p className="text-sm text-red-600 mt-1">
            {result.error || "로그 서버에 연결할 수 없습니다. 관리자에게 문의하세요."}
          </p>
        </div>
      )}

      <UserPartitionLogFilter 
        filter={filters} 
        metadata={filterMetadata}
        session={session}
      />
      
      <UserPartitionLogTable
        data={logData.records}
        metadata={metadata}
        page={filters.page}
        session={session}
      />
    </main>
  );
} 