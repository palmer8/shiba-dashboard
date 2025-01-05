"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { playerBanAction } from "@/actions/realtime/realtime-action";
import { RealtimeGameUserData } from "@/types/user";
import { useRouter } from "next/navigation";

// 밸리데이션 스키마
const banPlayerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ban"),
    reason: z.string().min(1, "사유를 입력해주세요"),
    bantime: z
      .number()
      .min(1, "정지 시간은 1시간 이상이어야 합니다")
      .max(72, "정지 시간은 최대 72시간(3일)입니다"),
  }),
  z.object({
    type: z.literal("unban"),
    reason: z.string().min(1, "사유를 입력해주세요"),
  }),
]);

type BanPlayerFormData = z.infer<typeof banPlayerSchema>;

interface BanPlayerDialogProps {
  userId: number;
  data: RealtimeGameUserData;
  open: boolean;
  setOpen: (open: boolean) => void;
  isBanned: boolean;
  onStatusChange: (newStatus: boolean) => void;
}

export default function BanPlayerDialog({
  userId,
  data,
  open,
  setOpen,
  isBanned,
  onStatusChange,
}: BanPlayerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<BanPlayerFormData>({
    resolver: zodResolver(banPlayerSchema),
    defaultValues: {
      type: isBanned ? "unban" : "ban",
      reason: "",
      bantime: isBanned ? 0 : 1,
    },
  });

  // isBanned가 변경될 때마다 form 값 업데이트
  useEffect(() => {
    form.reset({
      type: isBanned ? "unban" : "ban",
      reason: "",
      bantime: isBanned ? 0 : 1,
    });
  }, [isBanned, form]);

  const onSubmit = async (data: BanPlayerFormData) => {
    try {
      setIsLoading(true);
      const result = await playerBanAction(
        userId,
        data.reason,
        data.type === "ban" ? data.bantime : 0,
        data.type
      );

      if (result.success) {
        onStatusChange(!isBanned); // 부모 컴포넌트의 상태 업데이트
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast({
          title: `플레이어 ${data.type === "ban" ? "정지" : "정지 해제"} 실패`,
          description: result.error || "알 수 없는 오류가 발생했습니다",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: `플레이어 ${data.type === "ban" ? "정지" : "정지 해제"} 실패`,
        description: "서버 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isBanned ? "플레이어 정지 해제" : "플레이어 정지"}
          </DialogTitle>
          <DialogDescription>
            {isBanned
              ? "정지 해제 사유를 입력하세요."
              : "정보를 기입하고, 계정을 이용 정지합니다."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isBanned ? "정지 해제 사유" : "정지 사유"}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`${
                        isBanned ? "정지 해제" : "정지"
                      } 사유를 입력하세요`}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4">
              {!isBanned && (
                <FormField
                  control={form.control}
                  name="bantime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정지 시간 (시간)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={72}
                          placeholder="정지 시간을 입력하세요 (1~72시간)"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormItem>
                <FormLabel>대상 플레이어</FormLabel>
                <FormControl>
                  <Input
                    value={data.last_nickname || ""}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "처리중..." : isBanned ? "정지 해제" : "정지"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
