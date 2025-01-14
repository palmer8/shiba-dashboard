"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { getUserByIdAction } from "@/actions/user-action";
import { useRouter } from "next/navigation";
import { writeAdminLogAction } from "@/actions/log-action";

const StaleTokenProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const hasLoggedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const validateSession = async () => {
      const autoLogin = localStorage.getItem("autoLogin");

      if (status !== "authenticated") return;

      if (!session || !session.user || !session.user.id) {
        router.replace("/login");
        return;
      }

      if (autoLogin === undefined || autoLogin === null) {
        signOut({ callbackUrl: "/login" });
        return;
      }

      if (autoLogin === "false") localStorage.removeItem("autoLogin");

      try {
        const result = await getUserByIdAction(session.user.id);

        if (!result.success || !result.data) {
          signOut({ callbackUrl: "/login" });
          return;
        }

        const currentUser = result.data;

        const isValidSession =
          session.user.role === currentUser.role &&
          session.user.nickname === currentUser.nickname &&
          session.user.id === currentUser.id &&
          session.user.image === currentUser.image;

        if (
          session.user &&
          status === "authenticated" &&
          isValidSession &&
          !hasLoggedRef.current &&
          isMountedRef.current
        ) {
          await writeAdminLogAction("대시보드 접속");
          hasLoggedRef.current = true;
        }

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
