import { redirect } from "next/navigation";

// Fluxo de login consolidado em /auth/login.
export default function SignInPage() {
  redirect("/auth/login");
}
