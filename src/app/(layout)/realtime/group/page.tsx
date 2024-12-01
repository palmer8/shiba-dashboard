import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import RealtimeGroupSearch from "@/components/realtime/group/realtime-group-search";
import RealtimeGroupTable from "@/components/realtime/group/realtime-group-table";
import Empty from "@/components/ui/empty";
import { realtimeService } from "@/service/realtime-service";

export default async function RealtimeGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
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
      {groupName && !data?.users?.length && (
        <Empty description="검색된 그룹원이 없습니다." />
      )}
    </main>
  );
}
