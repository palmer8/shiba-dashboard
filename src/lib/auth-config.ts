import NextAuth from "next-auth";
import { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/db/postgresql/postgresql-client";
import CredentialsProvider from "next-auth/providers/credentials";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Prisma, PrismaClient } from "@generated/postgresql";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 2 },
  adapter: PrismaAdapter(
    prisma as PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) as Adapter,

  pages: {
    signIn: "/login",
    signOut: "/",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        name: { label: "name", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.name || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            name: credentials.name as string,
          },
        });

        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.nickname = token.nickname;
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.nickname = user.nickname;
        token.role = user.role;
      }
      return token;
    },
  },
});
