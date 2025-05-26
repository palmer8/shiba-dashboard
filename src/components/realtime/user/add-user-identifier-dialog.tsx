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

interface AddUserIdentifierDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: number;
  onAdd: (identifier: string) => Promise<void>;
}

export default function AddUserIdentifierDialog({
  open,
  setOpen,
  userId,
  onAdd,
}: AddUserIdentifierDialogProps) {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      toast({
        title: "오류",
        description: "식별자를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAdd(identifier.trim());
      setOpen(false);
      setIdentifier("");
    } catch (error) {
      console.error("식별자 추가 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setIdentifier("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>식별자 추가</DialogTitle>
          <DialogDescription>
            새로운 식별자를 추가합니다. 신중하게 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user-id">유저 ID</Label>
            <Input
              id="user-id"
              value={userId}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-identifier">새 식별자</Label>
            <Input
              id="new-identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="예: steam:110000123456789"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              형식: steam:숫자, discord:숫자, license:문자열 등
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />}
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 