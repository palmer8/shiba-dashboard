"use client";

import { useState, useEffect } from "react";
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
import { editBanDirectlyInDbAction } from "@/actions/ban-action";
import { XIcon, CopyIcon } from "lucide-react";

interface BanIdentifiersDialogProps {
  banId: string;
  currentUserId: string | null;
  currentName: string;
  currentBanreason: string;
  initialIdentifiers: string[];
}

export default function BanIdentifiersDialog({
  banId,
  currentUserId,
  currentName,
  currentBanreason,
  initialIdentifiers,
}: BanIdentifiersDialogProps) {
  const [open, setOpen] = useState(false);
  const [editableIdentifiers, setEditableIdentifiers] = useState<string[]>([]);
  const [newIdentifier, setNewIdentifier] = useState("");
  const { data: session } = useSession();
  const isMaster = hasAccess(session?.user?.role, UserRole.MASTER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEditableIdentifiers([...initialIdentifiers]);
      setNewIdentifier("");
    }
  }, [open, initialIdentifiers]);

  const handleCopy = (idfr: string) => {
    navigator.clipboard.writeText(idfr);
    toast({ title: "복사됨" });
  };

  const updateIdentifiersInDb = async (updatedIdentifiers: string[]) => {
    if (!isMaster) return;
    setIsSubmitting(true);
    const result = await editBanDirectlyInDbAction({
      id: banId,
      user_id: currentUserId,
      name: currentName,
      banreason: currentBanreason,
      identifiers: updatedIdentifiers,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "식별자 업데이트 성공" });
    } else {
      toast({
        title: "식별자 업데이트 실패",
        description: result.error || "DB 업데이트 중 오류 발생",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIdentifier = (idx: number) => {
    if (!isMaster) return;
    const arr = [...editableIdentifiers];
    arr.splice(idx, 1);
    setEditableIdentifiers(arr);
    updateIdentifiersInDb(arr);
  };

  const handleAddIdentifier = () => {
    if (!isMaster) return;
    const value = newIdentifier.trim();
    if (!value) return;
    if (editableIdentifiers.includes(value)) {
      toast({ title: "중복된 식별자입니다.", variant: "destructive" });
      return;
    }
    const arr = [...editableIdentifiers, value];
    setEditableIdentifiers(arr);
    setNewIdentifier("");
    updateIdentifiersInDb(arr);
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
          <DialogTitle>식별자 리스트 관리</DialogTitle>
          <DialogDescription>
            {isMaster
              ? "식별자 복사, 추가, 삭제가 가능합니다. 변경사항은 즉시 DB에 반영됩니다."
              : "식별자 복사만 가능합니다."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {editableIdentifiers.length > 0 ? (
            editableIdentifiers.map((idfr, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 border rounded-md bg-muted/30"
              >
                <span className="flex-grow truncate text-sm" title={idfr}>
                  {idfr}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleCopy(idfr)}
                  aria-label={`식별자 ${idfr} 복사`}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
                {isMaster && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteIdentifier(idx)}
                    disabled={isSubmitting}
                    aria-label={`식별자 ${idfr} 삭제`}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground flex justify-center py-4">
              등록된 식별자가 없습니다.
            </span>
          )}
        </div>
        {isMaster && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Input
              value={newIdentifier}
              onChange={(e) => setNewIdentifier(e.target.value)}
              placeholder="새 식별자 입력"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddIdentifier();
                }
              }}
              disabled={isSubmitting}
            />
            <Button
              type="button"
              onClick={handleAddIdentifier}
              disabled={isSubmitting}
            >
              {isSubmitting ? "처리중..." : "추가"}
            </Button>
          </div>
        )}
        <DialogFooter className="mt-4">
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
