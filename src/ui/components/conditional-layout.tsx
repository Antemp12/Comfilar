"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "~/ui/primitives/sonner";

export function ConditionalLayout({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && header}
      <main className={`flex min-h-screen flex-col`}>{children}</main>
      {!isAdminRoute && footer}
      <Toaster />
    </>
  );
}
