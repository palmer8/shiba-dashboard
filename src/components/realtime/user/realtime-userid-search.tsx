"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Clock, Search, X } from "lucide-react";
import { cn, formatKoreanDateTime } from "@/lib/utils";
import { RealtimeGameUserData } from "@/types/user";

interface RecentSearch {
  userId: number;
  nickname: string;
  timestamp: number;
}

interface RealtimeUseridSearchProps {
  userId: number | null;
  data?: RealtimeGameUserData;
}

export default function RealtimeUseridSearch({
  userId,
  data,
}: RealtimeUseridSearchProps) {
  const router = useRouter();
  const [userIdValue, setUserIdValue] = useState(userId);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searches = localStorage.getItem("recentUserSearches");
    if (searches) {
      setRecentSearches(JSON.parse(searches));
    }
  }, []);

  useEffect(() => {
    if (data && userId) {
      const newSearch = {
        userId,
        nickname: data.last_nickname || `고유번호 ${userId}`,
        timestamp: Date.now(),
      };

      const updatedSearches = [
        newSearch,
        ...recentSearches.filter((search) => search.userId !== userId),
      ].slice(0, 10);

      setRecentSearches(updatedSearches);
      localStorage.setItem(
        "recentUserSearches",
        JSON.stringify(updatedSearches)
      );
    }
  }, [data, userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userIdValue) return;
    router.replace(`/realtime/user?userId=${userIdValue}`);
  }

  const handleSearchClick = (searchUserId: number) => {
    setUserIdValue(searchUserId);
    router.replace(`/realtime/user?userId=${searchUserId}`);
    setIsFocused(false);
  };

  const handleRemoveSearch = (e: React.MouseEvent, searchUserId: number) => {
    e.stopPropagation();
    const newSearches = recentSearches.filter(
      (search) => search.userId !== searchUserId
    );
    setRecentSearches(newSearches);
    localStorage.setItem("recentUserSearches", JSON.stringify(newSearches));
  };

  return (
    <div className="relative w-[350px] max-md:w-full" ref={containerRef}>
      <form className="grid gap-2" onSubmit={handleSubmit}>
        <h1 className="font-medium text-sm text-muted-foreground">고유번호</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-md:w-[300px] md:w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="고유번호를 입력하세요."
              type="number"
              value={userIdValue || ""}
              maxLength={6}
              onChange={(e) => setUserIdValue(Number(e.target.value))}
              onFocus={() => setIsFocused(true)}
            />
          </div>
          <Button type="submit">조회</Button>
        </div>
      </form>

      {/* 최근 검색 드롭다운 */}
      <div
        className={cn(
          "absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md transition-all z-50",
          "max-h-[280px] overflow-hidden",
          isFocused && recentSearches.length > 0
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="p-2">
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>최근 검색</span>
          </div>
          <div className="mt-1 space-y-1">
            {recentSearches
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((search) => (
                <div
                  key={search.userId}
                  onClick={() => handleSearchClick(search.userId)}
                  className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer group"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{search.userId}</span>
                      <span className="text-muted-foreground">
                        {search.nickname}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatKoreanDateTime(new Date(search.timestamp))}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleRemoveSearch(e, search.userId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
