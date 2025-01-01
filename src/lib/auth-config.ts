import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { Adapter } from "next-auth/adapters";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 2 },
  adapter: PrismaAdapter(prisma) as Adapter,
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
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
      session.user.isPermissive = token.isPermissive;
      session.user.userId = token.userId;
      return session;
    },
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.nickname = user.nickname;
        token.role = user.role;
        token.isPermissive = user.isPermissive;
        token.userId = user.userId;
      }
      return token;
    },
  },
});
