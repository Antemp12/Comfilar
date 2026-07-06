"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";

/**
 * Aviso na dashboard que aparece só quando há notificações por ler.
 */
export function NewNotificationsBanner() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/notifications?limit=1", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as { unreadCount?: number };
        if (active) setUnread(data.unreadCount ?? 0);
      } catch {
        /* ignora */
      }
    };
    load();
    const t = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  if (unread <= 0) return null;

  return (
    <Link
      href="/admin/notifications"
      className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
        <Bell className="h-5 w-5 text-primary" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Tens {unread} notificação(ões) por ler
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Novos pedidos, reuniões ou mensagens — clica para ver
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </Link>
  );
}
