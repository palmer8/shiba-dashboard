"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getGameNicknameByUserIdAction } from "@/actions/user-action";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  RewardRevokeCreditType,
  ActionType,
  RewardRevoke,
  Status,
  UserRole,
} from "@prisma/client";
import { useMemo, useState, useEffect } from "react";
import { formatKoreanNumber } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { editCreditAction } from "@/actions/credit-action";
import { Session } from "next-auth";

interface EditCreditDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  credit: any;
  session: Session;
}

interface CreditValues {
  userId: string;
  creditType: RewardRevokeCreditType;
  type: ActionType;
  amount: string;
  reason: string;
}

export default function EditCreditDialog({
  open,
  setOpen,
  credit,
  session,
  ...props
}: EditCreditDialogProps) {
  const [nickname, setNickname] = useState<string>("");
  const [isLoadingNickname, setIsLoadingNickname] = useState(false);

  const form = useForm<CreditValues>({
    defaultValues: {
      userId: credit.userId.toString(),
      creditType: credit.creditType,
      type: credit.type,
      amount: credit.amount.toString(),
      reason: credit.reason,
    },
  });

  const formattedAmount = useMemo(() => {
    const amount = Number(form.watch("amount"));
    if (isNaN(amount) || amount <= 0) return "0";
    return formatKoreanNumber(amount);
  }, [form.watch("amount")]);

  const debouncedUserId = useDebounce(form.watch("userId"), 500);

  // 닉네임 가져오기
  const fetchNickname = async (userId: string) => {
    if (!userId || !/^\d+$/.test(userId)) {
      setNickname("");
      return;
    }
    setIsLoadingNickname(true);
    try {
      const result = await getGameNicknameByUserIdAction(Number(userId));
      if (result.success && result.data) {
        setNickname(result.data);
      } else {
        setNickname("사용자를 찾을 수 없습니다");
      }
    } catch (error) {
      setNickname("사용자 조회 중 오류가 발생했습니다");
    }
    setIsLoadingNickname(false);
  };

  // userId가 변경될 때마다 닉네임 조회
  useEffect(() => {
    fetchNickname(debouncedUserId);
  }, [debouncedUserId]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await editCreditAction(credit.id, data);
      if (result.success) {
        toast({ title: "재화 지급/회수 티켓 수정 완료" });
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      toast({
        title: "재화 지급/회수 티켓 수정 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  });

  const canEdit = (status: Status, userId: string, userRole: UserRole) => {
    return (
      (status === "PENDING" && userId === (session.user?.id ?? "")) ||
      userRole === UserRole.SUPERMASTER
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>재화 지급/회수 티켓 수정</DialogTitle>
          <DialogDescription>
            재화 지급/회수 티켓을 수정합니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              name="userId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고유번호</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="고유번호를 입력하세요"
                      className="max-w-[200px]"
                      onInput={(e) => {
                        const value = e.currentTarget.value.replace(
                          /[^0-9]/g,
                          ""
                        );
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-muted-foreground">
                    {isLoadingNickname
                      ? "닉네임 조회 중..."
                      : nickname || "고유번호를 입력하세요"}
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="creditType"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>재화 종류</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="재화 종류 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONEY">현금</SelectItem>
                        <SelectItem value="BANK">계좌</SelectItem>
                        <SelectItem value="CREDIT">무료 캐시</SelectItem>
                        <SelectItem value="CREDIT2">유료 캐시</SelectItem>
                        <SelectItem value="CURRENT_COIN">마일리지</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>유형</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="유형 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADD">지급</SelectItem>
                        <SelectItem value="REMOVE">회수</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="amount"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>수량</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      placeholder="수량을 입력하세요"
                      className="max-w-[200px]"
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-muted-foreground">
                    {formattedAmount}원
                  </div>
                </FormItem>
              )}
            />

            <FormField
              name="reason"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사유</FormLabel>
                  <FormDescription>
                    재화 지급/회수 사유를 입력하세요 (최대 50자)
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="사유를 입력하세요"
                      className="resize-none"
                      rows={4}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                추가
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
