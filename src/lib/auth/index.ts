import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowed } from "./check-email";

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

      // Check if email is allowed (based on config + Employee table)
      const allowed = await isEmailAllowed(email);
      if (!allowed) {
        // Return error URL with message
        return "/login?error=AccessDenied";
      }

      return true;
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
