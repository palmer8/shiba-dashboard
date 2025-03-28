"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Status } from "@prisma/client";

export function CreditTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as Status) || "PENDING";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", value);
    params.set("page", "1"); // 탭 변경시 첫 페이지로
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={status} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="PENDING">대기중</TabsTrigger>
        <TabsTrigger value="APPROVED">승인됨</TabsTrigger>
        <TabsTrigger value="REJECTED">거절됨</TabsTrigger>
        <TabsTrigger value="CANCELLED">취소됨</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
