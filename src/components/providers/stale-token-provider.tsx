"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { getUserByIdAction } from "@/actions/user-action";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const StaleTokenProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const validateSession = async () => {
      if (status !== "authenticated") return;

      if (!session || !session.user || !session.user.id) {
        router.replace("/login");
        return;
      }

      try {
        const result = await getUserByIdAction(session.user.id);

        if (!result.success || !result.data) {
          toast({
            title: "세션이 만료되었습니다.",
            description: "다시 로그인해주세요.",
            variant: "destructive",
          });
          signOut({ callbackUrl: "/login" });
          return;
        }

        const currentUser = result.data;

        // 세션의 정보와 DB의 정보 비교
        const isValidSession =
          session.user.role === currentUser.role &&
          session.user.nickname === currentUser.nickname &&
          session.user.id === currentUser.id;

        if (!isValidSession) {
          toast({
            title: "사용자 정보가 변경되었습니다.",
            description: "다시 로그인해주세요.",
            variant: "destructive",
          });
          signOut({ callbackUrl: "/login" });
        }
      } catch (error) {
        console.error("Session validation error:", error);
        toast({
          title: "세션 검증 중 오류가 발생했습니다.",
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        signOut({ callbackUrl: "/login" });
      }
    };

    validateSession();
  }, [session, status, router]);

  return <>{children}</>;
};

export default StaleTokenProvider;
