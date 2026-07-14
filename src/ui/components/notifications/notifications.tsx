import type * as React from "react";

import { Bell, Check, X } from "lucide-react";

import { cn } from "~/lib/cn";
import { Button } from "~/ui/primitives/button";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "~/ui/primitives/dropdown-menu";

import type { Notification } from "./notification-center";

interface NotificationsProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}

function formatTimestamp(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Agora mesmo";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return minutes === 1 ? "Há 1 minuto" : `Há ${minutes} minutos`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return hours === 1 ? "Há 1 hora" : `Há ${hours} horas`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return days === 1 ? "Há 1 dia" : `Há ${days} dias`;
}

function getFallbackColor(type: Notification["type"]) {
  switch (type) {
    case "error":
      return "#ef4444";
    case "success":
      return "#22c55e";
    case "warning":
      return "#f59e0b";
    case "info":
    default:
      return "#3b82f6";
  }
}

function getNotificationIcon(notification: Notification) {
  const color = notification.color ?? getFallbackColor(notification.type);
  return (
    <div
      className="h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onDismiss,
  onMarkAsRead,
}) => {
  if (notifications.length === 0) {
    return (
      <div
        className={"flex flex-col items-center justify-center py-6 text-center"}
      >
        <Bell className="mb-2 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Nenhuma notificação ainda</p>
        <p className="text-xs text-muted-foreground">
          Quando receber notificações, elas aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
      {notifications.map((notification) => (
        <DropdownMenuItem
          className={cn(
            "flex cursor-default flex-col items-start p-0",
            !notification.read && "bg-muted/50"
          )}
          key={notification.id}
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex w-full items-start gap-2 p-2">
            <div className="mt-1 flex-shrink-0">
              {getNotificationIcon(notification)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm leading-none font-medium">
                  {notification.title}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(notification.timestamp)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {notification.description}
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-1">
              {!notification.read && (
                <Button
                  className="h-6 w-6"
                  onClick={() => onMarkAsRead?.(notification.id)}
                  size="icon"
                  variant="ghost"
                >
                  <Check className="h-3 w-3" />
                  <span className="sr-only">Marcar como lida</span>
                </Button>
              )}
              <Button
                className="h-6 w-6"
                onClick={() => onDismiss?.(notification.id)}
                size="icon"
                variant="ghost"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Dispensar</span>
              </Button>
            </div>
          </div>
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
};
