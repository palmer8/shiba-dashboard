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
import { ItemComboBox } from "@/components/global/item-combo-box";
import { RotateCcw } from "lucide-react";
import { Session } from "next-auth";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";

interface GameDataFilterProps {
  data: any;
  currentPage: number;
  type: GameDataType;
  session: Session;
  error: string | null;
}

export default function GameDataFilter({
  error,
  data,
  currentPage,
  type,
  session,
}: GameDataFilterProps) {
  const router = useRouter();

  const initialQuery = useMemo(() => {
    return {
      type: type || "ITEM_CODE",
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 입력값 검증
    if (!query.type) return;

    // ITEM_CODE나 ITEM_NAME인 경우 itemId 필수
    if (
      (query.type === "ITEM_CODE" || query.type === "ITEM_NAME") &&
      !query.itemId
    ) {
      return;
    }

    // 값이 필요한 경우 검증
    if (
      !["INSTAGRAM", "NICKNAME", "REGISTRATION"].includes(query.type) &&
      !query.value
    ) {
      return;
    }

    if (query.type === "ITEM_CODE" || query.type === "ITEM_NAME") {
      router.replace(
        `/log/game?type=${query.type}&itemId=${query.itemId}&value=${query.value}&condition=${query.condition}&page=1`
      );
    } else {
      router.replace(
        `/log/game?type=${query.type}&value=${query.value}&condition=${query.condition}&page=1`
      );
    }
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
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="contents">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>유형 선택</Label>
            <Select
              value={query.type}
              onValueChange={(value) =>
                setQuery({ ...initialQuery, type: value as GameDataType })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ITEM_CODE">아이템 코드</SelectItem>
                <SelectItem value="ITEM_NAME">아이템 이름</SelectItem>
                <SelectItem value="NICKNAME">닉네임</SelectItem>
                <SelectItem value="INSTAGRAM">인스타그램 계정</SelectItem>
                {hasAccess(session.user?.role, UserRole.SUPERMASTER) && (
                  <>
                    <SelectItem value="CURRENT_CASH">보유 캐시</SelectItem>
                    <SelectItem value="ACCUMULATED_CASH">누적 캐시</SelectItem>
                  </>
                )}
                <SelectItem value="CREDIT">골드 박스</SelectItem>
                <SelectItem value="CREDIT2">프리미엄 박스</SelectItem>
                <SelectItem value="WALLET">현금</SelectItem>
                <SelectItem value="BANK">계좌</SelectItem>
                <SelectItem value="MILEAGE">마일리지</SelectItem>
                <SelectItem value="REGISTRATION">차량번호</SelectItem>
                {hasAccess(session.user?.role, UserRole.INGAME_ADMIN) && (
                  <SelectItem value="COMPANY">팩션 공동 계좌 잔고</SelectItem>
                )}
                <SelectItem value="IP">IP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {query.type === "ITEM_CODE" && (
            <div className="space-y-2">
              <Label>아이템 코드</Label>
              <Input
                placeholder="아이템 코드"
                value={query.itemId}
                onChange={(e) => setQuery({ ...query, itemId: e.target.value })}
              />
            </div>
          )}

          {query.type === "ITEM_NAME" && (
            <div className="grid gap-2">
              <Label className="mt-2">아이템 이름</Label>
              <ItemComboBox
                key={query.type}
                value={query.itemId}
                onChange={(item) => setQuery({ ...query, itemId: item.id })}
                placeholder="아이템 이름 검색..."
                className="w-full sm:w-[300px]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>값 입력</Label>
            <Input
              placeholder="값 입력"
              value={query.value}
              onChange={(e) => setQuery({ ...query, value: e.target.value })}
            />
          </div>

          {!["INSTAGRAM", "NICKNAME", "REGISTRATION", "COMPANY", "IP"].includes(
            query.type
          ) && (
            <div className="space-y-2">
              <Label>조건 선택</Label>
              <Select
                value={query.condition}
                onValueChange={(value) =>
                  setQuery({ ...query, condition: value })
                }
              >
                <SelectTrigger>
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
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            초기화
          </Button>
          <Button type="submit">조회</Button>
        </div>
      </form>
    </div>
  );
}
