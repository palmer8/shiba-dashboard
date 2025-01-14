"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Clock, Search, X } from "lucide-react";
import { cn, formatKoreanDateTime } from "@/lib/utils";
import { getGameNicknameByUserIdAction } from "@/actions/user-action";

interface RecentSearch {
  userId: number;
  nickname: string;
  timestamp: number;
}

interface RealtimeUseridSearchProps {
  userId: number | null;
  onSearch: (userId: number) => void;
}

export default function RealtimeUseridSearch({
  userId,
  onSearch,
}: RealtimeUseridSearchProps) {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userIdValue) return;

    const nicknameResult = await getGameNicknameByUserIdAction(userIdValue);
    const nickname = nicknameResult.success ? nicknameResult.data : null;

    if (!nickname) return;

    const newSearch: RecentSearch = {
      userId: userIdValue,
      nickname: nickname,
      timestamp: Date.now(),
    };

    const existingSearches = JSON.parse(
      localStorage.getItem("recentUserSearches") || "[]"
    );

    const updatedSearches = [
      newSearch,
      ...existingSearches.filter(
        (search: RecentSearch) => search.userId !== userIdValue
      ),
    ].slice(0, 10);

    localStorage.setItem("recentUserSearches", JSON.stringify(updatedSearches));
    setRecentSearches(updatedSearches);

    onSearch(userIdValue);
    setIsFocused(false);
  }

  const handleSearchClick = async (searchUserId: number) => {
    const existingSearch = recentSearches.find(
      (search) => search.userId === searchUserId
    );

    if (!existingSearch?.nickname) {
      const nicknameResult = await getGameNicknameByUserIdAction(searchUserId);
      if (nicknameResult.success) {
        const updatedSearches = recentSearches.map((search) =>
          search.userId === searchUserId
            ? { ...search, nickname: nicknameResult.data }
            : search
        );
        setRecentSearches(updatedSearches as RecentSearch[]);
        localStorage.setItem(
          "recentUserSearches",
          JSON.stringify(updatedSearches)
        );
      }
    }

    setUserIdValue(searchUserId);
    onSearch(searchUserId);
    setIsFocused(false);
  };

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

  const handleRemoveSearch = (e: React.MouseEvent, searchUserId: number) => {
    e.stopPropagation();
    const newSearches = recentSearches.filter(
      (search) => search.userId !== searchUserId
    );
    setRecentSearches(newSearches);
    localStorage.setItem("recentUserSearches", JSON.stringify(newSearches));
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
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
              onBlur={handleBlur}
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
