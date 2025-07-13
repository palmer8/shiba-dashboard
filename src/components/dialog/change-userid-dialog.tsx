"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { changeUserIdAction } from "@/actions/realtime/realtime-action";
import { Session } from "next-auth";
import { Loader2 } from "lucide-react";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";

interface ChangeUserIdDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentUserId: number;
  session: Session;
  mutate: () => Promise<any>;
}

export default function ChangeUserIdDialog({
  open,
  setOpen,
  currentUserId,
  session,
  mutate,
}: ChangeUserIdDialogProps) {
  const { toast } = useToast();
  const [newUserId, setNewUserId] = useState("");
  const [step, setStep] = useState<"input" | "confirm" | "done">("input");
  const [loading, setLoading] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isNewIdExists, setIsNewIdExists] = useState<boolean | undefined>(
    undefined
  );
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMaster =
    session?.user && hasAccess(session.user.role, UserRole.MASTER);

  const handleCheck = async () => {
    setError(null);
    setWarning(null);
    setLastLogin(null);
    setIsOnline(false);
    setStep("input");
    setWarning(null);
    setIsNewIdExists(undefined);
    if (!newUserId || isNaN(Number(newUserId))) {
      setError("변경할 고유번호를 올바르게 입력하세요.");
      return;
    }
    setLoading(true);
    try {
      const result = await changeUserIdAction(
        currentUserId,
        Number(newUserId),
        false
      );
      const fetchedIsNewIdExists = result.data?.isNewUserIdExists;
      setLastLogin(result.data?.lastLoginDate || null);
      setIsOnline(result.data?.isCurrentUserOnline || false);
      setIsNewIdExists(fetchedIsNewIdExists);
      if (!result.success) {
        setError(
          result.error || "고유번호 변경 전 확인 중 오류가 발생했습니다."
        );
        return;
      } else {
        setWarning(result.error || null);
        setStep("confirm");
      }
    } catch (e) {
      setError("고유번호 변경 전 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await changeUserIdAction(
        currentUserId,
        Number(newUserId),
        true
      );
      if (result.success) {
        toast({
          title: "고유번호 변경 성공",
          description: `유저 고유번호가 ${currentUserId} → ${newUserId}로 변경되었습니다.`,
        });
        setStep("done");
        mutate();
        setTimeout(() => setOpen(false), 1200);
      } else {
        setError(result.error || "고유번호 변경에 실패했습니다.");
      }
    } catch (e) {
      setError("고유번호 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewUserId("");
    setStep("input");
    setLastLogin(null);
    setIsOnline(false);
    setWarning(null);
    setError(null);
    setIsNewIdExists(undefined);
  };

  if (!isMaster) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>유저 고유번호 변경</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="currentUserId">
              기존 고유번호
            </label>
            <Input
              id="currentUserId"
              value={currentUserId}
              readOnly
              tabIndex={-1}
              aria-label="기존 고유번호"
              className="bg-muted cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="newUserId">
              변경할 고유번호
            </label>
            <Input
              id="newUserId"
              value={newUserId}
              onChange={(e) =>
                setNewUserId(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="숫자만 입력"
              tabIndex={0}
              aria-label="변경할 고유번호"
              disabled={step !== "input" || loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && step === "input") handleCheck();
              }}
              autoFocus
            />
          </div>
          {lastLogin && (
            <div className="text-xs text-muted-foreground">
              마지막 접속일: {lastLogin}
            </div>
          )}
          {typeof isNewIdExists === "boolean" && (
            <div className="text-xs text-muted-foreground">
              변경할 ID 존재 여부:{" "}
              {isNewIdExists ? "존재함" : "존재하지 않음 (새 번호)"}
            </div>
          )}
          {typeof isOnline === "boolean" && (
            <div className="text-xs text-muted-foreground">
              기존 고유번호 온라인 여부: {isOnline ? "온라인" : "오프라인"}
            </div>
          )}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {warning && step === "confirm" && (
            <div className="text-sm text-yellow-600 font-medium whitespace-pre-line border border-yellow-300 bg-yellow-50 rounded p-2">
              {warning}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          {step === "input" && (
            <Button
              onClick={handleCheck}
              disabled={loading || !newUserId}
              tabIndex={0}
              aria-label="고유번호 변경 확인"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : null}
              확인
            </Button>
          )}
          {step === "confirm" && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                tabIndex={0}
                aria-label="취소"
              >
                취소
              </Button>
              <Button
                onClick={handleChange}
                disabled={loading}
                tabIndex={0}
                aria-label="최종 변경"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : null}
                최종 변경
              </Button>
            </>
          )}
          {step === "done" && (
            <Button onClick={handleClose} tabIndex={0} aria-label="닫기">
              닫기
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
