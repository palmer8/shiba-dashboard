"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { getUserByIdAction } from "@/actions/user-action";
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
          signOut({ callbackUrl: "/login" });
        }
      } catch (error) {
        signOut({ callbackUrl: "/login" });
      }
    };

    validateSession();
  }, [session, status, router]);

  return <>{children}</>;
};

export default StaleTokenProvider;
