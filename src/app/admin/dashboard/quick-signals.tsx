"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";

/**
 * Cartões de ação rápida com contadores ao vivo (Notificações e Mensagens),
 * para a zona "Ações Rápidas" da dashboard. Atualiza a cada 30s.
 */
export function QuickSignals() {
  const [unread, setUnread] = useState(0);
  const [msgUnread, setMsgUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/notifications?limit=1", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          unreadCount?: number;
          unreadByType?: Record<string, number>;
        };
        if (active) {
          setUnread(data.unreadCount ?? 0);
          setMsgUnread(data.unreadByType?.mensagem ?? 0);
        }
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

  return (
    <>
      <QuickCard
        href="/admin/notifications"
        icon={<Bell className="h-6 w-6" />}
        title="Notificações"
        subtitle="Pedidos, reuniões e avisos"
        count={unread}
      />
      <QuickCard
        href="/admin/messages"
        icon={<MessageSquare className="h-6 w-6" />}
        title="Mensagens"
        subtitle="Enviar a clientes"
        count={msgUnread}
      />
    </>
  );
}

function QuickCard({
  href,
  icon,
  title,
  subtitle,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      {count > 0 && (
        <span className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}
