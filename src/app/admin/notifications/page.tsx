"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/ui/primitives/button";

interface AdminNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  color: string | null;
  relatedId: number | null;
  read: boolean;
  createdAt: string;
}

function fallbackColor(type: string): string {
  if (type === "pedido_criado") return "#f59e0b";
  if (type === "reuniao_cancelada") return "#ef4444";
  if (type.startsWith("pedido_") || type.startsWith("reuniao_")) return "#22c55e";
  if (type === "promocao") return "#a855f7";
  return "#3b82f6";
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const days = Math.floor(h / 24);
  return `há ${days} dia${days > 1 ? "s" : ""}`;
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [busy, setBusy] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=100", { credentials: "include" });
      if (!res.ok) throw new Error("Falha ao carregar");
      const data = (await res.json()) as { data?: AdminNotification[] };
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = items.filter((n) => !n.read).length;
  const visible = filter === "unread" ? items.filter((n) => !n.read) : items;

  const markRead = async (id: number) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`/api/notifications/${id}`, { method: "PATCH", credentials: "include" });
  };

  const markAllRead = async () => {
    setBusy(true);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH", credentials: "include" });
      toast.success("Todas marcadas como lidas");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications/${id}`, { method: "DELETE", credentials: "include" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
            <Bell className="h-7 w-7" />
            Notificações
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-sm font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Novos pedidos, reuniões e mensagens do sistema
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="gap-2" onClick={markAllRead} disabled={busy}>
            <CheckCheck className="h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todas ({items.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Não lidas ({unreadCount})
        </Button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-700">
          {filter === "unread" ? "Não há notificações por ler." : "Ainda não há notificações."}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                n.read
                  ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              <span
                className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: n.color ?? fallbackColor(n.type) }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{n.title}</h3>
                  {!n.read && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      Nova
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead(n.id)}
                    aria-label="Marcar como lida"
                    title="Marcar como lida"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                  onClick={() => remove(n.id)}
                  aria-label="Eliminar"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
