"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupFilter } from "@/types/filters/admin-filter";
import { UserRole } from "@prisma/client";

interface AdminGroupFilterProps {
  filters: GroupFilter;
}

export function AdminGroupFilter({ filters }: AdminGroupFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localFilter, setLocalFilter] = useState<GroupFilter>(filters);

  const handleFilterChange = useCallback(
    (key: keyof GroupFilter, value: any) => {
      setLocalFilter((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (localFilter.name) params.set("name", localFilter.name);
    if (localFilter.role) params.set("role", localFilter.role);

    router.push(`?${params.toString()}`);
  }, [localFilter, router, searchParams]);

  const handleReset = useCallback(() => {
    router.push("?page=1");
    setLocalFilter({});
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>그룹명</Label>
          <Input
            placeholder="그룹명 입력"
            value={localFilter.name || ""}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>최소 권한</Label>
          <Select
            value={localFilter.role || "ALL"}
            onValueChange={(value) =>
              value === "ALL"
                ? handleFilterChange("role", undefined)
                : handleFilterChange("role", value as UserRole)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
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
        <Button onClick={handleSearch}>조회</Button>
      </div>
    </div>
  );
}
