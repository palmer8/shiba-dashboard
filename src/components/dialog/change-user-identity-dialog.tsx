"use client";

import { useState, useEffect } from "react";
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
import { changeUserIdentityAction } from "@/actions/realtime/realtime-action";
import { Session } from "next-auth";
import { Loader2 } from "lucide-react";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";

interface ChangeUserIdentityDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: number;
  session: Session;
  mutate: () => Promise<any>;
  currentRegistration?: string | null;
  currentPhone?: string | null;
}

export default function ChangeUserIdentityDialog({
  open,
  setOpen,
  userId,
  session,
  mutate,
  currentRegistration,
  currentPhone,
}: ChangeUserIdentityDialogProps) {
  const { toast } = useToast();
  const [registration, setRegistration] = useState("");
  const [phone, setPhone] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "confirm" | "done">("input");
  const [error, setError] = useState<string | null>(null);

  const isMaster =
    session?.user && hasAccess(session.user.role, UserRole.MASTER);

  useEffect(() => {
    if (open) {
      setRegistration(currentRegistration || "");
      setPhone(currentPhone || "");
      setRegError(null);
      setPhoneError(null);
      setError(null);
      setStep("input");
    }
  }, [open, currentRegistration, currentPhone]);

  // 실시간 중복 검증
  useEffect(() => {
    if (!registration || registration === currentRegistration) {
      setRegError(null);
      return;
    }
    const check = setTimeout(async () => {
      const result = await changeUserIdentityAction(
        userId,
        registration,
        undefined
      );
      if (!result.success && result.error?.includes("차량번호")) {
        setRegError(result.error);
      } else {
        setRegError(null);
      }
    }, 400);
    return () => clearTimeout(check);
  }, [registration, currentRegistration, userId]);

  useEffect(() => {
    if (!phone || phone === currentPhone) {
      setPhoneError(null);
      return;
    }
    const check = setTimeout(async () => {
      const result = await changeUserIdentityAction(userId, undefined, phone);
      if (!result.success && result.error?.includes("계좌번호")) {
        setPhoneError(result.error);
      } else {
        setPhoneError(null);
      }
    }, 400);
    return () => clearTimeout(check);
  }, [phone, currentPhone, userId]);

  const handleCheck = () => {
    setError(null);
    if (
      (!registration || registration === currentRegistration) &&
      (!phone || phone === currentPhone)
    ) {
      setError("수정할 정보가 없습니다.");
      return;
    }
    if (regError || phoneError) {
      setError("중복된 정보가 있습니다. 수정할 수 없습니다.");
      return;
    }
    setStep("confirm");
  };

  const handleChange = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await changeUserIdentityAction(
        userId,
        registration !== currentRegistration ? registration : undefined,
        phone !== currentPhone ? phone : undefined
      );
      if (result.success) {
        toast({
          title: "유저 정보 수정 성공",
          description: "차량번호/계좌번호가 성공적으로 변경되었습니다.",
        });
        setStep("done");
        mutate();
        setTimeout(() => setOpen(false), 1200);
      } else {
        setError(result.error || "유저 정보 수정에 실패했습니다.");
      }
    } catch (e) {
      setError("유저 정보 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setRegistration(currentRegistration || "");
    setPhone(currentPhone || "");
    setRegError(null);
    setPhoneError(null);
    setError(null);
    setStep("input");
  };

  if (!isMaster) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>유저 정보 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="registration">
              차량번호
            </label>
            <Input
              id="registration"
              value={registration}
              onChange={(e) =>
                setRegistration(e.target.value.trim().toUpperCase())
              }
              placeholder="차량번호 입력 (예: G99999)"
              tabIndex={0}
              aria-label="차량번호"
              disabled={step !== "input" || loading}
              autoFocus
            />
            {regError && <div className="text-xs text-red-500">{regError}</div>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="phone">
              계좌번호
            </label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="계좌번호 입력 (숫자만)"
              tabIndex={0}
              aria-label="계좌번호"
              disabled={step !== "input" || loading}
            />
            {phoneError && (
              <div className="text-xs text-red-500">{phoneError}</div>
            )}
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
        <DialogFooter className="gap-2">
          {step === "input" && (
            <Button
              onClick={handleCheck}
              disabled={loading}
              tabIndex={0}
              aria-label="수정 확인"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : null}
              수정 확인
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
                aria-label="최종 수정"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : null}
                최종 수정
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
