import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to dashboard (will add auth check later)
  redirect("/dashboard");
}
