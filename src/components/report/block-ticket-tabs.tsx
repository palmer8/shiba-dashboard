"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Status } from "@prisma/client";

export function BlockTicketTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as Status) || "PENDING";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={status} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="PENDING">대기중</TabsTrigger>
        <TabsTrigger value="APPROVED">승인됨</TabsTrigger>
        <TabsTrigger value="REJECTED">거절됨</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
