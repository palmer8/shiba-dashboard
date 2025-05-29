"use client";

import { useState, useEffect } from "react";
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
import { BlockTicket, UserRole } from "@prisma/client";
import {
  EditIncidentReportFormData,
  editIncidentReportSchema,
} from "@/lib/validations/report";
import { ImageUpload } from "@/components/ui/image-upload";
import Image from "next/image";
import { DateTimePicker24h } from "../ui/datetime-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getBlockTicketByIdsOriginAction } from "@/actions/report-action";

interface EditIncidentReportDialogProps {
  initialData: IncidentReport;
  trigger: React.ReactNode;
}

export default function EditIncidentReportDialog({
  initialData,
  trigger,
}: EditIncidentReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isBlockRequest, setIsBlockRequest] = useState(false);
  const [isPermanentBlock, setIsPermanentBlock] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [blockTicket, setBlockTicket] = useState<BlockTicket | null>(null);
  const { data: session } = useSession();
  const isStaff = session?.user?.role === "STAFF";

  // Dialog가 열릴 때 BlockTicket 조회
  useEffect(() => {
    if (open) {
      getBlockTicketByIdsOriginAction([initialData.report_id.toString()]).then(
        (result) => {
          if (result.success && result.data && result.data.length > 0) {
            // 데이터 배열이 존재하고 비어있지 않은지 확인
            setBlockTicket(result.data[0]);
            setIsBlockRequest(true);
          } else {
            setBlockTicket(null);
            setIsBlockRequest(false);
          }
        }
      );
    } else {
      // Dialog가 닫힐 때 상태 초기화
      setBlockTicket(null);
      setIsBlockRequest(false);
    }
  }, [open, initialData.report_id]);

  const form = useForm<EditIncidentReportFormData>({
    resolver: zodResolver(editIncidentReportSchema),
    defaultValues: {
      reportId: initialData.report_id,
      reason: initialData.reason,
      incidentDescription: initialData.incident_description,
      incidentTime: new Date(initialData.incident_time),
      penaltyType: initialData.penalty_type,
      warningCount: initialData.warning_count || 0,
      banDurationHours: initialData.ban_duration_hours || 0,
      targetUserId: initialData.target_user_id,
      targetUserNickname: initialData.target_user_nickname,
      reportingUserId: initialData.reporting_user_id,
      reportingUserNickname: initialData.reporting_user_nickname,
      image: initialData.image || "",
      detentionTimeMinutes: initialData.detention_time_minutes || 0,
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

  const handleSubmit = async (data: EditIncidentReportFormData) => {
    try {
      const processedData = { ...data };

      // 처벌 유형에 따른 필드 초기화
      switch (data.penaltyType) {
        case "게임정지":
          processedData.warningCount = 0;
          processedData.detentionTimeMinutes = 0;

          // 스태프가 이용 정지 요청을 했을 경우
          if (isStaff && isBlockRequest) {
            processedData.banDurationHours = 72;
            processedData.isBlockRequest = true;
          }
          // 관리자가 영구 정지를 선택했을 경우
          else if (!isStaff && isPermanentBlock) {
            processedData.isPermanentBlock = true;
          }
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

      const result = await updateIncidentReportAction(processedData);

      if (result.success) {
        toast({
          title:
            isStaff && isBlockRequest
              ? "이용 정지 요청이 수정되었습니다"
              : "사건 처리 보고서가 수정되었습니다",
        });
        setOpen(false);
      } else {
        toast({
          title: "사건 처리 보고서 수정 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "사건 처리 보고서 수정 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: EditIncidentReportFormData) => {
    // 이전에 이용 정지 요청이 없었고, 현재 이용 정지 요청을 하는 경우
    if (watchPenaltyType === "게임정지" && isBlockRequest && !blockTicket) {
      setShowConfirmModal(true);
      return;
    }
    await handleSubmit(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>사건 처리 보고서 수정</DialogTitle>
            <DialogDescription>
              사건 처리 보고서의 내용을 수정합니다.
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
                      <DateTimePicker24h
                        date={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
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
                        {session?.user && hasAccess(session.user.role, UserRole.MASTER) && (
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
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            min={1}
                            max={72}
                            disabled={
                              isStaff ? isBlockRequest : isPermanentBlock
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchPenaltyType === "게임정지" && isStaff && (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={isBlockRequest}
                      onCheckedChange={(checked) =>
                        setIsBlockRequest(checked === true)
                      }
                      disabled={blockTicket?.status === "APPROVED"}
                    />
                  </FormControl>
                  <FormLabel>
                    {blockTicket?.status === "APPROVED"
                      ? "승인된 이용 정지 요청"
                      : "이용 정지 요청"}
                  </FormLabel>
                </FormItem>
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
                              field.onChange(parseInt(e.target.value) || "")
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
                            min={0}
                            max={1440}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || "")
                            }
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
                name="targetUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대상자 고유번호</FormLabel>
                    <FormControl>
                      <Input
                        required={true}
                        type="number"
                        max={999999}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? 0 : parseInt(value) || 0
                          );
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
                        max={999999}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? 0 : parseInt(value) || 0
                          );
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
                      <Input
                        disabled={true}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>증거 사진</FormLabel>
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
                  수정
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이용 정지 요청 확인</AlertDialogTitle>
            <AlertDialogDescription>
              이전에는 이용 정지 요청이 포함되지 않은 보고서였습니다. 수정된
              내용으로 다시 이용 정지 요청을 진행하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmModal(false)}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowConfirmModal(false);
                await handleSubmit(form.getValues());
              }}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
