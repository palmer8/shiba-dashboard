"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface BanIdentifiersDialogProps {
  identifiers: string[];
  onChange?: (newIdentifiers: string[]) => void; // MASTER 이상만
}

export default function BanIdentifiersDialog({
  identifiers: initialIdentifiers,
  onChange,
}: BanIdentifiersDialogProps) {
  const [open, setOpen] = useState(false);
  const [identifiers, setIdentifiers] = useState<string[]>(initialIdentifiers);
  const [newIdentifier, setNewIdentifier] = useState("");
  const { data: session } = useSession();
  const isMaster = hasAccess(session?.user?.role, UserRole.MASTER);

  const handleCopy = (idfr: string) => {
    navigator.clipboard.writeText(idfr);
    toast({ title: "복사됨" });
  };

  const handleDelete = (idx: number) => {
    if (!isMaster) return;
    const arr = [...identifiers];
    arr.splice(idx, 1);
    setIdentifiers(arr);
    onChange?.(arr);
  };

  const handleAdd = () => {
    if (!isMaster) return;
    const value = newIdentifier.trim();
    if (!value) return;
    if (identifiers.includes(value)) {
      toast({ title: "중복된 식별자입니다.", variant: "destructive" });
      return;
    }
    const arr = [...identifiers, value];
    setIdentifiers(arr);
    setNewIdentifier("");
    onChange?.(arr);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View {initialIdentifiers.length} identifiers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>식별자 리스트</DialogTitle>
          <DialogDescription>
            {isMaster
              ? "식별자 복사, 추가, 삭제가 가능합니다."
              : "식별자 복사만 가능합니다."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {identifiers.length > 0 ? (
            identifiers.map((idfr, idx) => (
              <div key={idfr + idx} className="flex items-center gap-2">
                <span className="truncate max-w-[220px]">{idfr}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(idfr)}
                >
                  복사
                </Button>
                {isMaster && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(idx)}
                  >
                    삭제
                  </Button>
                )}
              </div>
            ))
          ) : (
            <span className="text-muted-foreground">없음</span>
          )}
        </div>
        {isMaster && (
          <div className="flex gap-2 mt-4">
            <Input
              value={newIdentifier}
              onChange={(e) => setNewIdentifier(e.target.value)}
              placeholder="새 식별자 입력"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button type="button" onClick={handleAdd}>
              추가
            </Button>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
