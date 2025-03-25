"use client";

import useSWR from "swr";
import RealtimeUseridSearch from "./realtime-userid-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RealtimeUserInfo from "./realtime-user-info";
import RealtimeUserItem from "../item/realtime-user-item";
import RealtimeUserGroup from "../group/realtime-user-group";
import Empty from "@/components/ui/empty";
import { Session } from "next-auth";
import { getUserDataAction } from "@/actions/realtime/realtime-action";
import { useState } from "react";
import { LoadingOverlay } from "@/components/global/loading";
import RealtimeUserLogs from "./realtime-user-logs";

interface RealtimeUserWrapperProps {
  session: Session;
  isAdmin: boolean;
}

export default function RealtimeUserWrapper({
  session,
  isAdmin,
}: RealtimeUserWrapperProps) {
  const [userId, setUserId] = useState<number | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `user-${userId}` : null,
    async () => {
      if (!userId) return null;
      const response = await getUserDataAction(userId);
      if (!response.success || response.error) {
        throw new Error(
          response.data?.message ||
            response.error ||
            "데이터를 불러올 수 없습니다."
        );
      }
      return response.data;
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  const handleSearch = (newUserId: number) => {
    setUserId(newUserId);
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="w-full h-full flex justify-center items-center">
          <Empty description={error.message} />
        </div>
      );
    }

    if (isLoading) {
      return <LoadingOverlay />;
    }

    if (!data) {
      return (
        <Empty description="해당 고유번호를 가진 유저의 데이터를 찾을 수 없습니다." />
      );
    }

    return (
      <Tabs defaultValue="info" className="mt-6">
        <TabsList>
          <TabsTrigger value="info">유저 정보</TabsTrigger>
          <TabsTrigger value="item">보유 아이템</TabsTrigger>
          <TabsTrigger value="group">그룹 정보</TabsTrigger>
          <TabsTrigger value="log">로그 정보</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <RealtimeUserInfo
            userId={userId!}
            data={data}
            isAdmin={isAdmin}
            session={session}
            mutate={mutate}
          />
        </TabsContent>
        <TabsContent value="item">
          <RealtimeUserItem
            data={{
              weapons: data.weapons || {},
              inventory: data.inventory || {},
              vehicles: data.vehicles || {},
            }}
            mutate={mutate}
            userId={userId!}
            isAdmin={isAdmin}
            session={session}
          />
        </TabsContent>
        <TabsContent value="group">
          <RealtimeUserGroup
            data={data}
            userId={userId!}
            session={session}
            mutate={mutate}
          />
        </TabsContent>
        <TabsContent value="log">
          <RealtimeUserLogs userId={userId!} session={session} />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="space-y-6">
      <RealtimeUseridSearch userId={userId} onSearch={handleSearch} />
      {renderContent()}
    </div>
  );
}
