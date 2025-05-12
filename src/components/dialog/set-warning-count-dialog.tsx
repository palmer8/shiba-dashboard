"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { setWarningCountAction } from "@/actions/realtime/realtime-action"; // 직접 설정 액션 임포트
import { Session } from "next-auth";
import { Loader2 as LoadingSpinner } from "lucide-react";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";

interface SetWarningCountDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: number;
  currentWarningCount: number | null | undefined;
  session: Session;
  mutate: () => Promise<any>;
}

export default function SetWarningCountDialog({
  open,
  setOpen,
  userId,
  currentWarningCount,
  session,
  mutate,
}: SetWarningCountDialogProps) {
  const { toast } = useToast();
  const [newWarningCount, setNewWarningCount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 마스터 이상 권한 확인
  const canSetCount =
    session?.user && hasAccess(session.user.role, UserRole.MASTER);

  useEffect(() => {
    // 다이얼로그가 열릴 때 현재 경고 횟수로 초기화
    if (open) {
      setNewWarningCount((currentWarningCount ?? 0).toString());
      setError(null); // 에러 상태 초기화
    }
  }, [open, currentWarningCount]);

  const handleSetCount = async () => {
    setError(null); // 이전 에러 메시지 초기화
    const count = parseInt(newWarningCount, 10);

    if (isNaN(count) || count < 0 || count > 7) {
      setError("경고 횟수는 0에서 7 사이의 숫자여야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const result = await setWarningCountAction(userId, count); // 직접 설정 액션 호출
      if (result.success) {
        toast({
          title: "경고 횟수 설정 성공",
          description: `경고 횟수가 ${count}회로 설정되었습니다.`,
        });
        mutate(); // 데이터 새로고침
        setOpen(false); // 성공 시 다이얼로그 닫기
      } else {
        setError(result.error || "경고 횟수 설정에 실패했습니다.");
      }
    } catch (e) {
      setError("경고 횟수 설정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // 상태 초기화 없이 다이얼로그만 닫기
    setOpen(false);
  };

  // 권한 없으면 렌더링 안함 (실제로는 이 다이얼로그를 여는 버튼이 안보일 것)
  if (!canSetCount) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>경고 횟수 직접 설정</DialogTitle>
          <DialogDescription>
            사용자의 경고 횟수를 0에서 7 사이의 숫자로 설정합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="warning-count" className="text-right">
              경고 횟수
            </label>
            <Input
              id="warning-count"
              type="number"
              value={newWarningCount}
              onChange={(e) =>
                setNewWarningCount(e.target.value.replace(/[^0-7]/g, ""))
              }
              className="col-span-3 h-9 tabular-nums"
              min={0}
              max={7}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSetCount()}
              autoFocus
            />
          </div>
          {error && (
            <p className="col-span-4 text-sm text-red-500 text-center">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleClose}
            >
              취소
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSetCount} disabled={loading}>
            {loading && (
              <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            설정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
