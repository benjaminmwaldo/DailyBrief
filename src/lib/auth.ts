import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import { authConfig } from "./auth.config";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      console.log("[auth] signIn callback:", {
        userId: user?.id,
        email: user?.email,
        provider: account?.provider,
      });
      return true;
    },
    async redirect({ url, baseUrl }) {
      // After magic link verification, always go to dashboard
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
      // For relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}/dashboard`;
      }
      return `${baseUrl}/dashboard`;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
