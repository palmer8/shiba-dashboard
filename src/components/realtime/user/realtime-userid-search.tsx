"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RealtimeUseridSearchProps {
  userId: number | null;
}

export default function RealtimeUseridSearch({
  userId,
}: RealtimeUseridSearchProps) {
  const router = useRouter();
  const [userIdValue, setUserIdValue] = useState(userId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.replace(`/realtime/user?userId=${userIdValue}`);
  }

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <h1 className="font-medium text-sm text-muted-foreground">고유번호</h1>
      <div className="flex items-center gap-2">
        <Input
          className="md:w-[300px]"
          placeholder="고유번호를 입력하세요."
          type="number"
          value={userIdValue || ""}
          maxLength={6}
          onChange={(e) => {
            setUserIdValue(Number(e.target.value));
          }}
        />
        <Button type="submit">조회</Button>
      </div>
    </form>
  );
}
