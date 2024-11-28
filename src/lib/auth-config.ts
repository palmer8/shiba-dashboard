import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/db/postgresql/postgresql-client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 2 },
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      id: "credentials",
      credentials: {
        name: { label: "name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            name: credentials.name,
          },
          select: {
            id: true,
            name: true,
            hashedPassword: true,
          },
        });

        if (
          !user ||
          !user.hashedPassword ||
          !(await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          ))
        ) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      session.user.name = token.name;
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
      }
      return token;
    },
  },
});
