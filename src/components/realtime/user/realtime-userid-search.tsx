"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { Clock, Search, X } from "lucide-react";
import { formatKoreanDateTime } from "@/lib/utils";
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
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searches = localStorage.getItem("recentUserSearches");
    if (searches) {
      setRecentSearches(JSON.parse(searches));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        recentRef.current &&
        !recentRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowRecent(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSubmit() {
    if (!userIdValue) return;

    const nicknameResult = await getGameNicknameByUserIdAction(userIdValue);
    if (!nicknameResult.success) return;

    const newSearch = {
      userId: userIdValue,
      nickname: nicknameResult.data,
      timestamp: Date.now(),
    };

    const updatedSearches = [
      newSearch,
      ...recentSearches.filter((search) => search.userId !== userIdValue),
    ].slice(0, 10);

    localStorage.setItem("recentUserSearches", JSON.stringify(updatedSearches));
    setRecentSearches(updatedSearches as RecentSearch[]);
    onSearch(userIdValue);
    setShowRecent(false);
  }

  const handleSearchClick = (searchUserId: number) => {
    setUserIdValue(searchUserId);
    onSearch(searchUserId);
    setShowRecent(false);
  };

  const handleRemoveSearch = (
    e: React.MouseEvent<HTMLButtonElement>,
    searchUserId: number
  ) => {
    e.stopPropagation();
    const newSearches = recentSearches.filter(
      (search) => search.userId !== searchUserId
    );
    setRecentSearches(newSearches);
    localStorage.setItem("recentUserSearches", JSON.stringify(newSearches));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="w-[350px] max-md:w-full grid gap-2">
      <h1 className="font-medium text-sm text-muted-foreground">고유번호</h1>
      <div className="flex items-center gap-2">
        <div
          className="relative flex-1 max-md:w-[300px] md:w-full"
          ref={recentRef}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            className="pl-9"
            placeholder="고유번호를 입력하세요."
            type="number"
            value={userIdValue || ""}
            maxLength={6}
            onChange={(e) => setUserIdValue(Number(e.target.value))}
            onFocus={() => setShowRecent(true)}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              if (!e.relatedTarget?.closest(".recent-searches")) {
                setShowRecent(false);
              }
            }}
          />
          {showRecent && (
            <div className="recent-searches absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md z-50">
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>최근 검색</span>
                </div>
                {recentSearches.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-center text-muted-foreground">
                    최근 검색 기록이 없습니다
                  </div>
                ) : (
                  <div className="mt-1 max-h-[240px] overflow-y-auto">
                    {recentSearches.map((search) => (
                      <div
                        key={search.userId}
                        onClick={() => handleSearchClick(search.userId)}
                        className="flex items-center justify-between px-2 py-2 text-sm cursor-pointer"
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
                          className="h-6 w-6"
                          onClick={(e) => handleRemoveSearch(e, search.userId)}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Button onClick={handleSubmit}>조회</Button>
      </div>
    </div>
  );
}
