import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { Adapter } from "next-auth/adapters";
import * as bcrypt from "bcrypt";

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
        if (!credentials?.name || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            name: credentials.name as string,
          },
        });

        if (!user) {
          return null;
        }

        const validPassword = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword || ""
        );

        if (!validPassword) {
          return null;
        }

        // NextAuth User 타입에 맞게 변환
        return {
          id: user.id,
          name: user.name || user.nickname,
          email: user.email,
          image: user.image,
          nickname: user.nickname,
          role: user.role,
          isPermissive: user.isPermissive,
          userId: user.userId,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      const customUser = session.user as any;
      customUser.id = token.sub as string;
      customUser.nickname = token.nickname;
      customUser.role = token.role;
      customUser.isPermissive = token.isPermissive;
      customUser.userId = token.userId;
      return session;
    },
    async jwt({ token, user }) {
      if (user && user.id) {
        const customUser = user as any;
        token.id = user.id;
        token.nickname = customUser.nickname;
        token.role = customUser.role;
        token.isPermissive = customUser.isPermissive;
        token.userId = customUser.userId;
      }
      return token;
    },
  },
});
