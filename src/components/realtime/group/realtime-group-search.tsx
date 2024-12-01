"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RealtimeGroupSearchProps {
  groupName: string | undefined;
}

export default function RealtimeGroupSearch({
  groupName,
}: RealtimeGroupSearchProps) {
  const router = useRouter();
  const [groupNameValue, setGroupNameValue] = useState(groupName || "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (groupNameValue.trim()) {
      router.replace(`/realtime/group?groupName=${groupNameValue}`);
    }
  }

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <h1 className="font-medium text-sm text-muted-foreground">그룹 이름</h1>
      <div className="flex items-center gap-2">
        <Input
          className="md:w-[300px]"
          placeholder="그룹 이름을 입력하세요."
          value={groupNameValue}
          onChange={(e) => setGroupNameValue(e.target.value)}
        />
        <Button type="submit">조회</Button>
      </div>
    </form>
  );
}
