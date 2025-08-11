"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Copy, Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getItemsByItemNameAction } from "@/actions/realtime/realtime-user-item-action";
import Empty from "@/components/ui/empty";

interface Item {
  itemId: string;
  itemName: string;
}

export function ItemsSearchTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "복사 완료",
        description: `${itemName}의 아이템 코드 (${text})가 클립보드에 복사되었습니다.`,
      });
    } catch (err) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "검색어 입력",
        description: "아이템 이름이나 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const result = await getItemsByItemNameAction(searchTerm.trim());
      if (result.success) {
        setItems(result.data);
      } else {
        setItems([]);
        toast({
          title: "검색 실패",
          description: result.error || "아이템 검색에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setItems([]);
      toast({
        title: "검색 오류",
        description: "아이템 검색 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* 검색 영역 */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="아이템 이름 또는 코드로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading || !searchTerm.trim()}
          className="px-4"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          검색
        </Button>
      </div>

      {/* 결과 영역 */}
      {hasSearched && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>검색 중...</span>
            </div>
          ) : items.length === 0 ? (
            <Empty description="검색 결과가 없습니다. 다른 검색어로 시도해보세요." />
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                "{searchTerm}" 검색 결과: {items.length}개 아이템
              </div>
              
              {/* 테이블 - border 제거 */}
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="w-[200px]">아이템 코드</TableHead>
                      <TableHead>아이템 이름</TableHead>
                      <TableHead className="w-[100px]">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.itemId}
                        className="cursor-pointer hover:bg-muted/50 border-b-0"
                        onClick={() => copyToClipboard(item.itemId, item.itemName)}
                      >
                        <TableCell className="font-mono text-sm">
                          {item.itemId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.itemName}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.itemId, item.itemName);
                            }}
                            className="h-8 px-2"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            복사
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      )}

      {/* 초기 상태 안내 */}
      {!hasSearched && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">아이템 검색</p>
          <p>아이템 이름이나 코드를 입력하고 검색 버튼을 눌러주세요.</p>
        </div>
      )}
    </div>
  );
}
