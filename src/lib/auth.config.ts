import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";

// Edge-compatible auth config (no Prisma adapter)
export const authConfig = {
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "briefs@dailybrief.com",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/verify",
    error: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/chat");
      const isAuthRoute = nextUrl.pathname.startsWith("/sign-in");

      if (isProtectedRoute && !isLoggedIn) {
        return false; // Redirect to sign-in
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
