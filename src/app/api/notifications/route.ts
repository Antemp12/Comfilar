import { NextRequest, NextResponse } from "next/server";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications-service";

/**
 * GET /api/notifications
 * Obter notificações do usuário
 * Query params:
 * - userId: number
 * - unreadOnly: boolean (default false)
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId é obrigatório" },
        { status: 400 },
      );
    }

    // Validar limites
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: "Limite deve estar entre 1 e 100" },
        { status: 400 },
      );
    }

    const userId_num = parseInt(userId, 10);

    // Buscar notificações
    const notifications = await getUserNotifications(userId_num, {
      unreadOnly,
      limit,
      offset,
    });

    // Contar não lidas
    const unreadCount = await getUnreadNotificationCount(userId_num);

    return NextResponse.json(
      {
        success: true,
        data: notifications.map((notif: any) => ({
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          color: notif.color ?? null,
          relatedId: notif.relatedId,
          read: notif.read,
          sentEmail: notif.sentEmail,
          createdAt: notif.createdAt,
        })),
        unreadCount,
        pagination: {
          limit,
          offset,
          total: notifications.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar notificações" },
      { status: 500 },
    );
  }
}
