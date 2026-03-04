import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      department?: string | null;
      role?: string;
      jobTitle?: string | null;
    } & DefaultSession["user"];
  }
}
