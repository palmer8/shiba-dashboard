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
import { Checkbox } from "@/components/ui/checkbox";
import { Session } from "next-auth";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";

// 밸리데이션 스키마
const banPlayerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ban"),
    reason: z.string().min(1, "사유를 입력해주세요"),
    bantime: z
      .number({
        message: "정지 시간을 입력해주세요",
      })
      .refine(
        (val) => val === -1 || (val >= 1 && val <= 72),
        (val) => ({
          message:
            val < 1
              ? "정지 시간은 1시간 이상이어야 합니다"
              : "정지 시간은 최대 72시간(3일)입니다",
        })
      ),
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
  session: Session;
  mutate: () => Promise<any>;
}

export default function BanPlayerDialog({
  userId,
  data,
  open,
  setOpen,
  session,
  mutate,
}: BanPlayerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPermanentBan, setIsPermanentBan] = useState(false);

  const form = useForm<BanPlayerFormData>({
    resolver: zodResolver(banPlayerSchema),
    defaultValues: {
      type: data.banned ? "unban" : "ban",
      reason: "",
      bantime: data.banned ? 0 : 1,
    },
  });

  useEffect(() => {
    form.reset({
      type: data.banned ? "unban" : "ban",
      reason: "",
      bantime: data.banned ? 0 : 1,
    });
    setIsPermanentBan(false);
  }, [data.banned, form]);

  const onSubmit = async (formData: BanPlayerFormData) => {
    try {
      setIsLoading(true);
      const result = await playerBanAction(
        userId,
        formData.reason,
        formData.type === "ban" ? formData.bantime : 0,
        formData.type
      );

      if (result.success) {
        toast({
          title: `플레이어 ${
            formData.type === "ban" ? "정지" : "정지 해제"
          } 성공`,
          description: "변경사항이 적용되었습니다.",
        });
        setOpen(false);
        form.reset();
        await mutate();
      } else {
        toast({
          title: `플레이어 ${
            formData.type === "ban" ? "정지" : "정지 해제"
          } 실패`,
          description: result.error || "알 수 없는 오류가 발생했습니다",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: `플레이어 ${
          formData.type === "ban" ? "정지" : "정지 해제"
        } 실패`,
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
            {data.banned ? "플레이어 정지 해제" : "플레이어 정지"}
          </DialogTitle>
          <DialogDescription>
            {data.banned
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
                  <FormLabel>{data.banned ? "특이사항" : "사유"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`${
                        data.banned ? "정지 해제" : "정지"
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
              {!data.banned && (
                <FormField
                  control={form.control}
                  name="bantime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정지 시간 (시간)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            required={true}
                            max={72}
                            placeholder="정지 시간을 입력하세요 (1~72시간)"
                            {...field}
                            disabled={isPermanentBan}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                          {hasAccess(
                            session.user!.role,
                            UserRole.INGAME_ADMIN
                          ) && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="permanentBan"
                                checked={isPermanentBan}
                                onCheckedChange={(checked) => {
                                  setIsPermanentBan(!!checked);
                                  if (checked) {
                                    field.onChange(-1);
                                  } else {
                                    field.onChange(1);
                                  }
                                }}
                              />
                              <label
                                htmlFor="permanentBan"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                영구 정지
                              </label>
                            </div>
                          )}
                        </div>
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
                {isLoading ? "처리중..." : data.banned ? "정지 해제" : "정지"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
