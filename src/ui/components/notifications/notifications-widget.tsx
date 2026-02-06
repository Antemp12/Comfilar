"use client";

import React from "react";

import { useAuth } from "~/lib/auth-context";

import type { Notification } from "./notification-center";

import { NotificationCenter } from "./notification-center";

export function NotificationsWidget() {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const toUiType = React.useCallback(
    (type: string): Notification["type"] => {
      if (type === "reuniao_cancelada") return "error";
      if (type.startsWith("pedido_")) return "success";
      if (type.startsWith("reuniao_")) return "success";
      if (type === "mensagem" || type === "sistema") return "info";
      if (type === "promocao") return "info";
      return "info";
    },
    [],
  );

  const fallbackColor = React.useCallback((type: string) => {
    if (type === "pedido_criado") return "#f59e0b";
    if (type === "reuniao_cancelada") return "#ef4444";
    if (type.startsWith("pedido_")) return "#22c55e";
    if (type.startsWith("reuniao_")) return "#22c55e";
    if (type === "mensagem" || type === "sistema") return "#3b82f6";
    if (type === "promocao") return "#a855f7";
    return "#3b82f6";
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      if (!response.ok) return;
      const data = await response.json();
      const mapped: Notification[] = (data.data || []).map((notif: any) => ({
        id: String(notif.id),
        title: notif.title,
        description: notif.message,
        read: Boolean(notif.read),
        timestamp: new Date(notif.createdAt),
        type: toUiType(notif.type),
        color: notif.color ?? fallbackColor(notif.type),
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  }, [user?.id, toUiType, fallbackColor]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch(`/api/notifications/read-all?userId=${user.id}`, {
      method: "PATCH",
    });
  };

  const handleDismiss = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  };

  const handleClearAll = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    await Promise.all(
      ids.map((id) => fetch(`/api/notifications/${id}`, { method: "DELETE" })),
    );
  };

  return (
    <NotificationCenter
      notifications={notifications}
      onClearAll={handleClearAll}
      onDismiss={handleDismiss}
      onMarkAllAsRead={handleMarkAllAsRead}
      onMarkAsRead={handleMarkAsRead}
    />
  );
}
