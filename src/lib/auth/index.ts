import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowedStatic } from "./config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) return false;

      // First check static allowlist (domains)
      if (isEmailAllowedStatic(email)) {
        return true;
      }

      // If not in static allowlist, check database via API
      // Note: In Edge runtime, we can't use Prisma directly
      // So we call our own API endpoint
      try {
        const baseUrl = process.env.NEXTAUTH_URL || "https://imod-portal.vercel.app";
        const res = await fetch(`${baseUrl}/api/auth/check-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.allowed) {
            return true;
          }
        }
      } catch (error) {
        console.error("Error checking email via API:", error);
      }

      // Return error URL with message
      return "/login?error=AccessDenied";
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
