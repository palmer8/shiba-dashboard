import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import RealtimeUserInfo from "@/components/realtime/user/realtime-user-info";
import RealtimeUserItem from "@/components/realtime/item/realtime-user-item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobalTitle } from "@/components/global/global-title";
import RealtimeUseridSearch from "@/components/realtime/user/realtime-userid-search";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { userService } from "@/service/user-service";
import { UserRole } from "@prisma/client";
import Empty from "@/components/ui/empty";
import { realtimeService } from "@/service/realtime-service";
import RealtimeUserGroup from "@/components/realtime/group/realtime-user-group";

export default async function RealtimeUserPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const userId = (await searchParams).userId
    ? Number((await searchParams).userId) || null
    : null;

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const isAccessiblePage = await userService.isAccessiblePage(
    session.user.id,
    UserRole.STAFF
  );

  if (!isAccessiblePage.data) {
    redirect("/");
  }

  let response = null;

  if (userId) {
    response = await realtimeService.getGameUserDataByUserId(userId);
  }

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="유저 정보"
        description="유저 정보 메뉴에서 고유번호를 통해 유저를 조회하고 관리하세요."
      />
      <RealtimeUseridSearch userId={userId} />
      {response?.data && userId && (
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">유저 정보</TabsTrigger>
            <TabsTrigger value="item">보유 아이템</TabsTrigger>
            <TabsTrigger value="group">그룹 정보</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <RealtimeUserInfo data={response.data} />
          </TabsContent>
          <TabsContent value="item">
            <RealtimeUserItem data={response.data} userId={userId} />
          </TabsContent>
          <TabsContent value="group">
            <RealtimeUserGroup data={response.data} userId={userId} />
          </TabsContent>
        </Tabs>
      )}
      {!response?.data && (
        <Empty description="해당 고유번호를 가진 유저의 데이터를 찾을 수 없습니다." />
      )}
    </main>
  );
}
