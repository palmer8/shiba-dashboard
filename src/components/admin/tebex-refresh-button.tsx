"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";

export function TebexRefreshButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/tebex/invalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "성공",
          description: result.message || "Tebex 캐시가 성공적으로 새로고침되었습니다.",
          variant: "default",
        });
      } else {
        toast({
          title: "오류",
          description: result.error || "Tebex 캐시 새로고침에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Tebex 캐시 새로고침 오류:", error);
      toast({
        title: "오류",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isLoading}
      className="flex items-center gap-2"
      variant="outline"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Tebex 캐시 새로고침
    </Button>
  );
}