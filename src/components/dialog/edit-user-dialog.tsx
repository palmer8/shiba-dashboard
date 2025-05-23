"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  updateUserAction,
  deleteUserAction,
  getUserByIdAction,
} from "@/actions/user-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { formatRole } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { EditUserFormValues, editUserSchema } from "@/lib/validations/user";

interface EditUserDialogProps {
  session: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function EditUserDialog({
  session,
  trigger,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      image: session?.user.image || "",
      password: undefined,
      confirmPassword: undefined,
    },
  });

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      getUserByIdAction(session.user.id).then((response) => {
        if (response.success && response.data) {
          setUserData(response.data);
        }
      });
    }
  }, [isOpen, session?.user?.id]);

  const onSubmit = async (data: EditUserFormValues) => {
    if (data.password || data.currentPassword || data.confirmPassword) {
      if (!data.password || !data.currentPassword || !data.confirmPassword) {
        toast({
          title: "비밀번호 변경 실패",
          description:
            "비밀번호 변경을 위해서는 모든 비밀번호 필드를 입력해주세요",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const result = await updateUserAction(session.user.id, {
        image: data.image,
        ...(data.password && data.currentPassword && data.confirmPassword
          ? {
              password: data.password,
              currentPassword: data.currentPassword,
            }
          : {}),
      });

      if (result.success) {
        signOut({ callbackUrl: "/login" });
        alert("프로필 수정이 완료되었습니다\n동기화를 위해 로그아웃 합니다.");
        setIsOpen && setIsOpen(false);
      } else {
        toast({
          title: "프로필 수정 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "프로필 수정 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== session.user.nickname) {
      toast({
        title: "닉네임이 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await deleteUserAction(
        session.user.id,
        session.user.nickname
      );
      if (result.success) {
        toast({
          title: "계정 삭제 완료",
        });
        setDeleteDialogOpen(false);
        setIsOpen && setIsOpen(false);
      } else {
        toast({
          title: "계정 삭제 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "계정 삭제 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>프로필 설정</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center gap-4">
                    <FormLabel>프로필 이미지</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={field.value || undefined} />
                          <AvatarFallback>
                            {session.user.nickname?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex gap-2">
                          <ImageUpload
                            value={field.value || ""}
                            disabled={isUploading}
                            onChange={field.onChange}
                            onUploadStart={() => setIsUploading(true)}
                            onUploadEnd={() => setIsUploading(false)}
                            isRemove={false}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                field.onChange("");
                                form.setValue("image", "", {
                                  shouldDirty: true,
                                });
                              }}
                            >
                              이미지 제거
                            </Button>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormItem>
                  <FormLabel>닉네임</FormLabel>
                  <FormControl>
                    <Input value={session.user.nickname || ""} disabled />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>고유번호</FormLabel>
                  <FormControl>
                    <Input value={userData?.userId || ""} disabled />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>현재 권한</FormLabel>
                  <FormControl>
                    <Input value={formatRole(userData?.role || "")} disabled />
                  </FormControl>
                </FormItem>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">비밀번호 변경</h4>
                <div className="space-y-4 rounded-lg border p-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>현재 비밀번호</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="현재 비밀번호를 입력해주세요"
                            type="password"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>새 비밀번호</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="변경할 비밀번호를 입력해주세요"
                            type="password"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>새 비밀번호 확인</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="변경할 비밀번호를 한번 더 입력해주세요"
                            type="password"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  계정 탈퇴
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen && setIsOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || !form.formState.isDirty}
                  >
                    저장
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수
              없습니다. 계속하시려면 닉네임을 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={`닉네임 입력 (${session.user.nickname})`}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>
              탈퇴하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
