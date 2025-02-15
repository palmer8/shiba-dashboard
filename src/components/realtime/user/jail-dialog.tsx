"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface JailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (time: number, reason: string) => void;
  isRelease?: boolean;
}

export function JailDialog({
  open,
  onOpenChange,
  onConfirm,
  isRelease = false,
}: JailDialogProps) {
  const [time, setTime] = useState<number>(0);
  const [reason, setReason] = useState("");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isRelease ? "구금 해제" : "구금 처리"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isRelease
              ? "해당 유저의 구금을 해제하시겠습니까?"
              : "해당 유저를 구금하시겠습니까?"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          {!isRelease && (
            <div className="space-y-2">
              <Label>구금 시간 (분)</Label>
              <Input
                type="number"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                min={1}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>사유</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="구금 사유를 입력하세요"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm(isRelease ? 0 : time, reason);
              onOpenChange(false);
            }}
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
