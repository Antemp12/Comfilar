import { redirect } from "next/navigation";

// Fluxo de registo consolidado em /auth/register.
export default function SignUpPage() {
  redirect("/auth/register");
}
