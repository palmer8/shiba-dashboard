"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GameDataTable } from "./game-data-table";
import { useRouter } from "next/navigation";
import { GameDataType } from "@/types/game";
import { toast } from "@/hooks/use-toast";

interface GameDataFilterProps {
  data: any;
  currentPage: number;
  type: GameDataType;
  error: string | null;
}

export default function GameDataFilter({
  error,
  data,
  currentPage,
  type,
}: GameDataFilterProps) {
  const router = useRouter();

  const initialQuery = useMemo(() => {
    return {
      type: "ITEM",
      itemId: "",
      value: "",
      condition: "gt",
    };
  }, []);

  const [query, setQuery] = useState(initialQuery);

  const handleReset = () => {
    router.replace("/log/game");
    setQuery(initialQuery);
  };

  const handleSearch = () => {
    if (query.type === "ITEM") {
      router.replace(
        `/log/game?type=${query.type}&itemId=${query.itemId}&value=${query.value}&condition=${query.condition}&page=1`
      );
    } else {
      router.replace(
        `/log/game?type=${query.type}&value=${query.value}&condition=${query.condition}&page=1`
      );
    }
  };

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("page", page.toString());
    router.replace(`/log/game?${searchParams.toString()}`);
  };

  useEffect(() => {
    if (!data && error) {
      toast({
        title: "데이터 요청에 오류가 발생하였습니다.",
        description: error,
      });
    }
  }, [data, error]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:flex sm:flex-wrap sm:items-end">
        <div className="grid gap-2">
          <Label>유형 선택</Label>
          <Select
            value={query.type}
            onValueChange={(value) =>
              setQuery({ ...initialQuery, type: value })
            }
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="아이템" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ITEM">아이템</SelectItem>
              <SelectItem value="CURRENT_CASH">보유 캐시</SelectItem>
              <SelectItem value="ACCUMULATED_CASH">누적 캐시</SelectItem>
              <SelectItem value="CREDIT">골드 박스</SelectItem>
              <SelectItem value="CREDIT2">프리미엄 박스</SelectItem>
              <SelectItem value="WALLET">현금</SelectItem>
              <SelectItem value="BANK">계좌</SelectItem>
              <SelectItem value="MILEAGE">마일리지</SelectItem>
              <SelectItem value="REGISTRATION">차량번호</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {query.type === "ITEM" && (
          <div className="grid w-full gap-2 sm:w-auto">
            <Label>아이템 ID</Label>
            <Input
              className="w-full sm:w-[200px]"
              placeholder="아이템 ID"
              value={query.itemId}
              onChange={(e) => setQuery({ ...query, itemId: e.target.value })}
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label>값 입력</Label>
          <Input
            className="w-full sm:w-[200px]"
            placeholder="값 입력 (수치)"
            value={query.value}
            onChange={(e) => setQuery({ ...query, value: e.target.value })}
          />
        </div>
        {query.type !== "REGISTRATION" && (
          <div className="grid gap-2">
            <Label>조건 선택</Label>
            <Select
              value={query.condition}
              onValueChange={(value) =>
                setQuery({ ...query, condition: value })
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="조건 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gt">{">"}</SelectItem>
                <SelectItem value="lt">{"<"}</SelectItem>
                <SelectItem value="gte">{">="}</SelectItem>
                <SelectItem value="lte">{"<="}</SelectItem>
                <SelectItem value="eq">{"="}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex gap-2 sm:self-end">
          <Button className="flex-1 sm:flex-none" onClick={handleSearch}>
            조회
          </Button>
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={handleReset}
          >
            초기화
          </Button>
        </div>
      </div>
      <GameDataTable
        type={query.type as GameDataType}
        queryType={type}
        data={data}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={data?.totalPages || 1}
      />
    </div>
  );
}
