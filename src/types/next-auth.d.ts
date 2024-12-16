/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRole } from "@generated/postgresql";
import NextAuth, { DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email?: string | null;
    nickname: string;
    role: UserRole;
    isPermissive: boolean;
  }

  interface Session extends DefaultSession {
    user?: User & {
      nickname: string;
      role: UserRole;
      isPermissive: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nickname: string;
    role: UserRole;
    isPermissive: boolean;
  }
}
