"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
import { RotateCcw, Loader2 } from "lucide-react";
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
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialQuery = useMemo(() => {
    return {
      type: type || "ITEM_CODE",
      itemId: "",
      value: "",
      condition: "gt",
    };
  }, []);

  const [query, setQuery] = useState(initialQuery);

  const handleReset = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      router.replace("/log/game");
      setQuery(initialQuery);
    } catch (error) {
      toast({
        title: "초기화 중 오류가 발생했습니다.",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [router, initialQuery, isSubmitting]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
      setIsSearching(true);

      const timeoutId = setTimeout(() => {
        try {
          // 입력값 검증
          if (!query.type) {
            toast({
              title: "유형을 선택해주세요.",
              variant: "destructive",
            });
            return;
          }

          // ITEM_CODE나 ITEM_NAME인 경우 itemId 필수
          if (
            (query.type === "ITEM_CODE" || query.type === "ITEM_NAME") &&
            !query.itemId
          ) {
            toast({
              title: "아이템을 선택해주세요.",
              variant: "destructive",
            });
            return;
          }

          // 값이 필요한 경우 검증
          if (
            !["INSTAGRAM", "NICKNAME", "REGISTRATION", "VEHICLE"].includes(
              query.type
            ) &&
            !query.value
          ) {
            toast({
              title: "값을 입력해주세요.",
              variant: "destructive",
            });
            return;
          }

          if (query.type === "ITEM_CODE" || query.type === "ITEM_NAME") {
            router.replace(
              `/log/game?type=${query.type}&itemId=${query.itemId}&value=${query.value}&condition=${query.condition}&page=1`,
              { scroll: false }
            );
          } else if (query.type === "VEHICLE") {
            router.replace(
              `/log/game?type=${query.type}&value=${query.value}&page=1`,
              { scroll: false }
            );
          } else {
            router.replace(
              `/log/game?type=${query.type}&value=${query.value}&condition=${query.condition}&page=1`,
              { scroll: false }
            );
          }
        } catch (error) {
          toast({
            title: "검색 중 오류가 발생했습니다.",
            description: "잠시 후 다시 시도해주세요.",
            variant: "destructive",
          });
        } finally {
          setIsSearching(false);
          setIsSubmitting(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [query, router, isSubmitting]
  );

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
              disabled={isSubmitting}
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
                <SelectItem value="VEHICLE">차량</SelectItem>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
          )}

          {query.type !== "ITEM_CODE" && query.type !== "ITEM_NAME" && (
            <div className="space-y-2">
              <Label>값 입력</Label>
              <Input
                placeholder="값 입력"
                value={query.value}
                onChange={(e) => setQuery({ ...query, value: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          )}

          {![
            "INSTAGRAM",
            "NICKNAME",
            "REGISTRATION",
            "COMPANY",
            "IP",
            "VEHICLE",
          ].includes(query.type) && (
            <div className="space-y-2">
              <Label>조건 선택</Label>
              <Select
                value={query.condition}
                onValueChange={(value) =>
                  setQuery({ ...query, condition: value })
                }
                disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            <RotateCcw className="h-4 w-4" />
            초기화
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                검색 중...
              </>
            ) : (
              "조회"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
