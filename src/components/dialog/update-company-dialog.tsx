"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { updateCompanyCapitalAction } from "@/actions/realtime/realtime-action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const updateCompanySchema = z.object({
  capital: z.number().min(0, "잔고는 0 이상이어야 합니다"),
});

type UpdateCompanyValues = z.infer<typeof updateCompanySchema>;

interface UpdateCompanyDialogProps {
  companyId: number;
  currentCapital: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function UpdateCompanyDialog({
  companyId,
  currentCapital,
  open,
  setOpen,
}: UpdateCompanyDialogProps) {
  const form = useForm<UpdateCompanyValues>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      capital: currentCapital,
    },
  });

  const onSubmit = async (data: UpdateCompanyValues) => {
    try {
      const result = await updateCompanyCapitalAction(companyId, data.capital);
      if (result.success) {
        toast({
          title: "잔고 수정 완료",
        });
        setOpen(false);
      } else {
        toast({
          title: "잔고 수정 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "잔고 수정 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>팩션 잔고 수정</DialogTitle>
          <DialogDescription>팩션의 잔고를 수정합니다.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="capital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>잔고</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
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
