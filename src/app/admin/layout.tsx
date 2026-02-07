"use client";

import type React from "react";
import { SidebarProvider, useSidebar } from "~/context/SidebarContext";
import AppSidebar from "~/ui/components/admin/AppSidebar";
import Backdrop from "~/ui/components/admin/Backdrop";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[270px]"
    : "lg:ml-[80px]";

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <Backdrop />
      <div className={`flex flex-1 flex-col transition-all duration-300 ${mainContentMargin}`}>
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
