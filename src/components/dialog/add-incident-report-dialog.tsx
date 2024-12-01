"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createIncidentReportAction } from "@/actions/report-action";
import { useSession } from "next-auth/react";

const schema = z.object({
  reason: z.string().min(1, "사유를 입력해주세요"),
  incidentDescription: z.string().min(10, "상세 내용을 10자 이상 입력해주세요"),
  incidentTime: z.date(),
  targetUserId: z.number().min(1, "대상자 ID를 입력해주세요"),
  targetUserNickname: z.string().min(1, "대상자 닉네임을 입력해주세요"),
  reportingUserId: z.number().optional(),
  reportingUserNickname: z.string().optional(),
  penaltyType: z.enum(["구두경고", "경고", "게임정지", "정지해제"]),
  warningCount: z.number().optional(),
  detentionTimeMinutes: z.number().optional(),
  banDurationHours: z.number().optional(),
});

export default function AddIncidentReportDialog() {
  const [open, setOpen] = useState(false);
  const [isPermanentBan, setIsPermanentBan] = useState(false);
  const { data: session } = useSession();
  const isStaff = session?.user?.role === "STAFF";

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: "",
      incidentDescription: "",
      incidentTime: new Date(),
      penaltyType: "경고",
      warningCount: 0,
      detentionTimeMinutes: 0,
      banDurationHours: 0,
    },
  });

  const watchPenaltyType = form.watch("penaltyType");

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const processedData = { ...data };

    // 영구정지 처리 로직
    if (watchPenaltyType === "게임정지" && isPermanentBan) {
      if (isStaff) {
        processedData.banDurationHours = 72;
      } else {
        processedData.banDurationHours = -1;
      }
    }

    const result = await createIncidentReportAction({
      ...processedData,
      reportingUserId: processedData.reportingUserId ?? undefined,
      warningCount: processedData.warningCount ?? null,
      detentionTimeMinutes: processedData.detentionTimeMinutes ?? null,
      banDurationHours: processedData.banDurationHours ?? null,
    });

    if (result.success) {
      if (isStaff && isPermanentBan) {
        toast.success(
          "영구정지 요청이 등록되었습니다. 관리자 승인 후 처리됩니다."
        );
      } else {
        toast.success("사건 처리 보고서가 등록되었습니다.");
      }
      setOpen(false);
      form.reset();
    } else {
      toast.error("보고서 등록에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      setIsPermanentBan(false);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>보고서 작성</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>사건 처리 보고서</DialogTitle>
          <DialogDescription>
            새로운 사건 처리 보고서를 작성합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 기본 정보 필드들 */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사유</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="사유를 입력하세요" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incidentDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세 내용</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="상세 내용을 입력하세요"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 처벌 관련 필드들 */}
            <FormField
              control={form.control}
              name="penaltyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>처벌 유형</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="처벌 유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="구두경고">구두경고</SelectItem>
                      <SelectItem value="경고">경고</SelectItem>
                      <SelectItem value="게임정지">게임정지</SelectItem>
                      {session?.user?.role === "MASTER" && (
                        <SelectItem value="정지해제">정지해제</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 조건부 필드들 */}
            {(watchPenaltyType === "구두경고" ||
              watchPenaltyType === "경고") && (
              <FormField
                control={form.control}
                name="warningCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>경고 횟수</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchPenaltyType === "게임정지" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="banDurationHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정지 시간 (시간)</FormLabel>
                      <div className="space-y-2">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            disabled={isPermanentBan}
                            min={1}
                            max={72}
                          />
                        </FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={isPermanentBan}
                            onCheckedChange={(checked) => {
                              setIsPermanentBan(!!checked);
                              if (checked) {
                                form.setValue(
                                  "banDurationHours",
                                  isStaff ? 72 : -1
                                );
                              } else {
                                form.setValue("banDurationHours", 1);
                              }
                            }}
                          />
                          <span className="text-sm">영구정지</span>
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                등록
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
