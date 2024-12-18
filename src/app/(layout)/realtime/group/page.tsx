import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import RealtimeGroupSearch from "@/components/realtime/group/realtime-group-search";
import RealtimeGroupTable from "@/components/realtime/group/realtime-group-table";
import Empty from "@/components/ui/empty";
import { auth } from "@/lib/auth-config";
import { realtimeService } from "@/service/realtime-service";
import { redirect } from "next/navigation";

export default async function RealtimeGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();

  if (!session || !session.user) return redirect("/login");

  if (session.user && !session.user.isPermissive) {
    return redirect("/pending");
  }

  const params = await searchParams;
  const groupName = params.groupName;
  const cursor = params.cursor ? Number(params.cursor) : 0;

  let data;
  if (groupName) {
    const result = await realtimeService.getGroupDataByGroupName(
      groupName,
      cursor
    );
    if (result.success) {
      data = result.data;
    }
  }

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="그룹 조회"
        description="그룹 이름을 통해 비슷한 이름을 가진 유저를 조회하고 관리할 수 있습니다."
      />
      <RealtimeGroupSearch groupName={groupName} />
      {groupName && <RealtimeGroupTable data={data} groupName={groupName} />}
      {!groupName && <Empty description="그룹 이름을 입력해주세요" />}
    </main>
  );
}
