import { redirect } from "next/navigation";

// A página inicial do cliente é /dashboard/home. Redireciona para lá.
export default function DashboardIndexPage() {
  redirect("/dashboard/home");
}
