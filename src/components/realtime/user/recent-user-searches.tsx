"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";

interface RecentSearch {
  userId: number;
  nickname: string;
  timestamp: number;
}

export default function RecentUserSearches() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const searches = localStorage.getItem("recentUserSearches");
    if (searches) {
      setRecentSearches(JSON.parse(searches));
    }
  }, []);

  const handleSearchClick = (userId: number) => {
    router.push(`/realtime/user?userId=${userId}`);
  };

  const handleRemoveSearch = (userId: number) => {
    const newSearches = recentSearches.filter(
      (search) => search.userId !== userId
    );
    setRecentSearches(newSearches);
    localStorage.setItem("recentUserSearches", JSON.stringify(newSearches));
  };

  if (recentSearches.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>최근 검색</span>
      </div>
      <ScrollArea className="h-[120px] w-full rounded-md border">
        <div className="p-4">
          <div className="space-y-2">
            {recentSearches
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 10)
              .map((search) => (
                <div
                  key={search.userId}
                  className="flex items-center justify-between group"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 px-2 h-8"
                    onClick={() => handleSearchClick(search.userId)}
                  >
                    <span className="font-medium">{search.userId}</span>
                    <span className="text-muted-foreground">
                      {search.nickname}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveSearch(search.userId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
