"use client";

import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface LogoutTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function LogoutText({ children, className, ...props }: LogoutTextProps) {
  return (
    <span
      onClick={() =>
        signOut({
          callbackUrl: "/login",
        })
      }
      className={cn("font-bold underline cursor-pointer", className)}
      {...props}
    >
      {children}
    </span>
  );
}
