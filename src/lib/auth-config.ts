import NextAuth, { User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/db/postgresql/postgresql-client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      id: "credentials",
      credentials: {
        userId: { label: "userId", type: "text" },
        username: { label: "username", type: "text" },
        name: { label: "name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials?.userId ||
          !credentials?.username ||
          !credentials.password
        ) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            userId: Number(credentials.userId),
          },
        });

        if (
          !user ||
          !(await bcrypt.compare(
            String(credentials.password),
            user.hashedPassword!
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
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const paths = ["/profile", "/client-side"];
      const isProtected = paths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/api/auth/signin", nextUrl.origin);
        redirectUrl.searchParams.append("callbackUrl", nextUrl.href);
        return Response.redirect(redirectUrl);
      }
      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as User;
        return {
          ...token,
          id: u.id,
        };
      }
      return token;
    },
    session(params) {
      return {
        ...params.session,
        user: {
          ...params.session.user,
          id: params.token.id as string,
          randomKey: params.token.randomKey,
        },
      };
    },
  },
});
