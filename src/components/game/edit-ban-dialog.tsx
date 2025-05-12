"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { editBanAction } from "@/actions/ban-action";
import { z } from "zod";

const editBanSchema = z.object({
  banreason: z.string().min(1, "차단 사유 필수"),
  identifiers: z.array(z.string().min(1, "식별자 필수")),
});

type EditBanFormData = z.infer<typeof editBanSchema>;

interface EditBanDialogProps {
  id: string;
  initialBanreason: string;
  initialIdentifiers: string[];
  trigger: React.ReactNode;
}

export default function EditBanDialog({
  id,
  initialBanreason,
  initialIdentifiers,
  trigger,
}: EditBanDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<EditBanFormData>({
    resolver: zodResolver(editBanSchema),
    defaultValues: {
      banreason: initialBanreason,
      identifiers: initialIdentifiers,
    },
  });
  const [newIdentifier, setNewIdentifier] = useState("");

  const handleAddIdentifier = () => {
    const value = newIdentifier.trim();
    if (!value) return;
    if (form.getValues("identifiers").includes(value)) {
      toast({ title: "중복된 식별자입니다.", variant: "destructive" });
      return;
    }
    form.setValue("identifiers", [...form.getValues("identifiers"), value]);
    setNewIdentifier("");
  };

  const handleRemoveIdentifier = (idx: number) => {
    const arr = [...form.getValues("identifiers")];
    arr.splice(idx, 1);
    form.setValue("identifiers", arr);
  };

  const onSubmit = async (data: EditBanFormData) => {
    if (data.identifiers.length === 0) {
      toast({ title: "식별자를 1개 이상 입력하세요", variant: "destructive" });
      return;
    }
    const result = await editBanAction({
      id,
      banreason: data.banreason,
      identifiers: data.identifiers,
    });
    if (result.success) {
      toast({ title: "하드밴 수정 성공" });
      setOpen(false);
    } else {
      toast({
        title: "하드밴 수정 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>하드밴 정보 수정</DialogTitle>
          <DialogDescription>
            식별자와 차단 사유를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="banreason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>차단 사유</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="차단 사유" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>식별자 리스트</FormLabel>
              <div className="flex gap-2 mt-2">
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
                />
                <Button type="button" onClick={handleAddIdentifier}>
                  추가
                </Button>
              </div>
              <ul className="mt-2 space-y-1">
                {form.watch("identifiers").map((idfr, idx) => (
                  <li key={idfr + idx} className="flex items-center gap-2">
                    <span className="truncate max-w-[200px]">{idfr}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveIdentifier(idx)}
                    >
                      삭제
                    </Button>
                  </li>
                ))}
              </ul>
              <FormMessage />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                수정
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
