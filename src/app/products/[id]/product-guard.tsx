"use client";

import { ProtectedRoute } from "~/lib/protected-route";

export function ProductGuard({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}