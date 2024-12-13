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
import { updateIncidentReportAction } from "@/actions/report-action";
import { useSession } from "next-auth/react";
import { IncidentReasonCombobox } from "@/components/report/incident-reason-combobox";
import { IncidentReport } from "@/types/report";
import { hasAccess } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { getGameNicknameByUserIdAction } from "@/actions/user-action";
import { UserRole } from "@prisma/client";

interface EditIncidentReportDialogProps {
  initialData: IncidentReport;
  trigger: React.ReactNode;
}

const schema = z.object({
  reportId: z.number(),
  reason: z.string().min(1, "사유를 입력해주세요"),
  incidentDescription: z.string().min(5, "상세 내용을 5자 이상 입력해주세요"),
  incidentTime: z.date(),
  targetUserId: z.coerce
    .number()
    .min(1, "대상자 ID를 입력해주세요")
    .transform((val) => (isNaN(val) ? 0 : val)),
  targetUserNickname: z.string().min(1, "대상자 닉네임을 입력해주세요"),
  reportingUserId: z.coerce
    .number()
    .transform((val) => (isNaN(val) ? 0 : val))
    .optional(),
  reportingUserNickname: z.string().optional(),
  penaltyType: z.enum(["구두경고", "경고", "게임정지", "정지해제"]),
  warningCount: z.coerce
    .number()
    .transform((val) => (isNaN(val) ? 0 : val))
    .optional(),
  banDurationHours: z.coerce
    .number()
    .transform((val) => (isNaN(val) ? 0 : val))
    .optional(),
});

export default function EditIncidentReportDialog({
  initialData,
  trigger,
}: EditIncidentReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPermanentBan, setIsPermanentBan] = useState(
    initialData.ban_duration_hours === -1
  );
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      reportId: initialData.report_id,
      reason: initialData.reason,
      incidentDescription: initialData.incident_description,
      incidentTime: new Date(initialData.incident_time),
      targetUserId: initialData.target_user_id || 0,
      targetUserNickname: initialData.target_user_nickname || "",
      reportingUserId: initialData.reporting_user_id || 0,
      reportingUserNickname: initialData.reporting_user_nickname || "",
      penaltyType: initialData.penalty_type as any,
      warningCount: initialData.warning_count || 0,
      banDurationHours: initialData.ban_duration_hours || 0,
    },
  });

  const watchPenaltyType = form.watch("penaltyType");

  const debouncedTargetUserId = useDebounce(form.watch("targetUserId"), 500);
  const debouncedReportingUserId = useDebounce(
    form.watch("reportingUserId"),
    500
  );

  useEffect(() => {
    if (debouncedTargetUserId) {
      getGameNicknameByUserIdAction(debouncedTargetUserId).then((result) => {
        if (result.success && result.data) {
          form.setValue("targetUserNickname", result.data);
        } else {
          form.setValue("targetUserNickname", "");
        }
      });
    } else {
      form.setValue("targetUserNickname", "");
    }
  }, [debouncedTargetUserId, form]);

  useEffect(() => {
    if (debouncedReportingUserId) {
      getGameNicknameByUserIdAction(debouncedReportingUserId).then((result) => {
        if (result.success && result.data) {
          form.setValue("reportingUserNickname", result.data);
        } else {
          form.setValue("reportingUserNickname", "");
        }
      });
    } else {
      form.setValue("reportingUserNickname", "");
    }
  }, [debouncedReportingUserId, form]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const result = await updateIncidentReportAction(data);

      if (result.success) {
        toast({
          title: "사건 처리 보고서가 수정되었습니다.",
        });
        setOpen(false);
      } else {
        toast({
          title: "사건 처리 보고서 수정에 실패했습니다.",
          description: "잠시 후에 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "사건 처리 보고서 수정에 실패했습니다.",
        description: "잠시 후에 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) return;
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>사건 처리 보고서 수정</DialogTitle>
          <DialogDescription>
            사건 처리 보고서 내용을 수정합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사유</FormLabel>
                  <FormControl>
                    <IncidentReasonCombobox
                      value={field.value}
                      onChange={field.onChange}
                    />
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
                      className="min-h-[200px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incidentTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사건 발생 시간</FormLabel>
                  <FormControl>
                    <Input
                      className="w-2/5 max-md:w-full"
                      type="datetime-local"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        field.onChange(date);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                      {hasAccess(session?.user?.role, UserRole.MASTER) && (
                        <SelectItem value="정지해제">정지해제</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
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
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            disabled={isPermanentBan}
                            min={-1}
                            max={72}
                          />
                        </FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={isPermanentBan}
                            onCheckedChange={(checked) => {
                              setIsPermanentBan(!!checked);
                              if (checked) {
                                form.setValue("banDurationHours", -1);
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

            <FormField
              control={form.control}
              name="targetUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대상자 고유번호</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={999999}
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : parseInt(value) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetUserNickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대상자 닉네임</FormLabel>
                  <FormControl>
                    <Input disabled={true} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportingUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>신고자 고유번호</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={999999}
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : parseInt(value) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportingUserNickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>신고자 닉네임</FormLabel>
                  <FormControl>
                    <Input disabled={true} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

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
