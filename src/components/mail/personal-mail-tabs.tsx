"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

export function PersonalMailTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const used = searchParams.get("used") || "1"; // 기본값은 사용됨(1)

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("used", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={used} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="1">사용됨</TabsTrigger>
        <TabsTrigger value="0">미사용</TabsTrigger>
      </TabsList>
    </Tabs>
  );
} 