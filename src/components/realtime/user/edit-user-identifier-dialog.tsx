import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 as LoadingSpinner } from "lucide-react";

interface EditUserIdentifierDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  identifier: string;
  onUpdate: (oldIdentifier: string, newIdentifier: string) => Promise<void>;
}

export default function EditUserIdentifierDialog({
  open,
  setOpen,
  identifier,
  onUpdate,
}: EditUserIdentifierDialogProps) {
  const [newIdentifier, setNewIdentifier] = useState(identifier);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newIdentifier.trim()) {
      toast({
        title: "오류",
        description: "식별자를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (newIdentifier === identifier) {
      toast({
        title: "알림",
        description: "변경사항이 없습니다.",
        variant: "default",
      });
      setOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(identifier, newIdentifier);
      setOpen(false);
      setNewIdentifier("");
    } catch (error) {
      console.error("식별자 수정 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewIdentifier(identifier);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>식별자 수정</DialogTitle>
          <DialogDescription>
            식별자 값을 수정합니다. 신중하게 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-identifier">현재 식별자</Label>
            <Input
              id="current-identifier"
              value={identifier}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-identifier">새 식별자</Label>
            <Input
              id="new-identifier"
              value={newIdentifier}
              onChange={(e) => setNewIdentifier(e.target.value)}
              placeholder="새로운 식별자를 입력하세요"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />}
            수정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 