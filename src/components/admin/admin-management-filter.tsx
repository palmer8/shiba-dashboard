"use client";

import { AdminFilter } from "@/types/filters/admin-filter";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@prisma/client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, RotateCcw } from "lucide-react";

interface AdminManagementFilterProps {
  filter: AdminFilter;
}

export default function AdminManagementFilter({
  filter,
}: AdminManagementFilterProps) {
  const router = useRouter();
  const [localFilter, setLocalFilter] = useState<AdminFilter>(filter);

  const handleFilterChange = useCallback(
    (key: keyof AdminFilter, value: AdminFilter[keyof AdminFilter]) => {
      setLocalFilter((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleSearch = useCallback(() => {
    const searchParams = new URLSearchParams();

    searchParams.set("page", "1");

    if (localFilter.nickname) {
      searchParams.set("nickname", localFilter.nickname);
    }
    if (localFilter.userId) {
      searchParams.set("userId", localFilter.userId.toString());
    }
    if (localFilter.role) {
      searchParams.set("role", localFilter.role);
    }

    router.replace(`?${searchParams.toString()}`);
  }, [localFilter, router]);

  const handleReset = useCallback(() => {
    router.replace("/admin");
    setLocalFilter({});
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            id="nickname"
            placeholder="닉네임"
            value={localFilter.nickname || ""}
            onChange={(e) => handleFilterChange("nickname", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userId">고유번호</Label>
          <Input
            id="userId"
            placeholder="고유번호"
            value={localFilter.userId || ""}
            onChange={(e) =>
              handleFilterChange("userId", Number(e.target.value))
            }
            type="number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">권한</Label>
          <Select
            value={localFilter.role}
            onValueChange={(value) =>
              handleFilterChange("role", value as UserRole)
            }
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="권한 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STAFF">스태프</SelectItem>
              <SelectItem value="INGAME_ADMIN">인게임 관리자</SelectItem>
              <SelectItem value="MASTER">마스터</SelectItem>
              <SelectItem value="SUPERMASTER">슈퍼 마스터</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          초기화
        </Button>
        <Button onClick={handleSearch} className="gap-2">
          조회
        </Button>
      </div>
    </div>
  );
}
