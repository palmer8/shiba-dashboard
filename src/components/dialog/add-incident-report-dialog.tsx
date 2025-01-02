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
import { createIncidentReportAction } from "@/actions/report-action";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/hooks/use-debounce";
import { getGameNicknameByUserIdAction } from "@/actions/user-action";
import { IncidentReasonCombobox } from "@/components/report/incident-reason-combobox";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import {
  addIncidentReportSchema,
  IncidentReportFormData,
} from "@/lib/validations/report";
import { Session } from "next-auth";
import { ImageUpload } from "@/components/ui/image-upload";
import Image from "next/image";

interface AddIncidentReportDialogProps {
  session: Session;
}

export default function AddIncidentReportDialog({
  session,
}: AddIncidentReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPermanentBan, setIsPermanentBan] = useState(false);
  const isStaff = session?.user?.role === "STAFF";

  const form = useForm<IncidentReportFormData>({
    resolver: zodResolver(addIncidentReportSchema),
    defaultValues: {
      reportingUserId: null,
      reportingUserNickname: null,
      warningCount: null,
      detentionTimeMinutes: null,
      banDurationHours: null,
      image: null,
      reason: "",
      incidentDescription: "",
      incidentTime: new Date(),
      targetUserId: 0,
      targetUserNickname: "",
      penaltyType: "구두경고",
    },
  });

  const watchPenaltyType = form.watch("penaltyType");

  const onSubmit = async (data: IncidentReportFormData) => {
    try {
      const processedData = { ...data };

      // 처벌 유형에 따른 필드 초기화
      switch (data.penaltyType) {
        case "게임정지":
          processedData.warningCount = 0;
          processedData.detentionTimeMinutes = 0;
          break;
        case "경고":
          processedData.banDurationHours = 0;
          break;
        case "구두경고":
          processedData.banDurationHours = 0;
          processedData.detentionTimeMinutes = 0;
          break;
        case "정지해제":
          processedData.warningCount = 0;
          processedData.detentionTimeMinutes = 0;
          processedData.banDurationHours = 0;
          break;
      }

      const result = await createIncidentReportAction(processedData);

      if (result.success) {
        if (isStaff && isPermanentBan) {
          toast({
            title: "영구정지 요청 등록 완료",
            description: "관리자 승인 후 처리됩니다.",
          });
        } else {
          toast({
            title: "사건 처리 보고서 등록 완료",
          });
        }
        setOpen(false);
        form.reset();
      } else {
        toast({
          title: "사건 처리 보고서 등록 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "사건 처리 보고서 등록 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      setIsPermanentBan(false);
    }
  }, [open, form]);

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

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void,
    allowNull = false
  ) => {
    const value = e.target.value;
    if (value === "" && allowNull) {
      onChange(null);
    } else {
      const numValue = parseInt(value) || 0;
      onChange(numValue);
    }
  };

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
                      {hasAccess(session?.user?.role, UserRole.MASTER) && (
                        <SelectItem value="정지해제">정지해제</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : parseInt(value));
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
                    <Input
                      disabled={true}
                      {...field}
                      value={field.value || ""}
                    />
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
                      value={field.value ?? ""}
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
                    <Input
                      disabled={true}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 조건부 필드들 */}
            {watchPenaltyType === "구두경고" && (
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
                        value={field.value ?? ""}
                        onChange={(e) =>
                          handleNumberInput(e, field.onChange, true)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchPenaltyType === "경고" && (
              <div className="space-y-4">
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
                          value={field.value ?? ""}
                          onChange={(e) =>
                            handleNumberInput(e, field.onChange, true)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detentionTimeMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>구금 시간 (분)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            handleNumberInput(e, field.onChange, true)
                          }
                          min={0}
                          max={1440}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchPenaltyType === "게임정지" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="banDurationHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정지 시간 (시간)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            handleNumberInput(e, field.onChange, true)
                          }
                          disabled={isPermanentBan}
                          min={-1}
                          max={72}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>첨거 사진</FormLabel>
                  <FormControl>
                    <div className="grid gap-2">
                      {field.value && (
                        <Image
                          src={field.value}
                          alt="첨부 사진"
                          width={100}
                          height={300}
                          className="rounded-md w-full h-full object-cover"
                        />
                      )}
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={(url) => field.onChange(url)}
                        onRemove={() => field.onChange(null)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
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
                등록
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
