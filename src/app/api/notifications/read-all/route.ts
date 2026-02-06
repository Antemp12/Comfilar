import { NextRequest, NextResponse } from "next/server";
import { markAllNotificationsAsRead } from "@/lib/notifications-service";

/**
 * PATCH /api/notifications/user/[userId]
 * Marcar todas as notificações como lidas
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId é obrigatório" },
        { status: 400 },
      );
    }

    await markAllNotificationsAsRead(parseInt(userId, 10));

    return NextResponse.json(
      { success: true, message: "Todas as notificações foram marcadas como lidas" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao marcar notificações como lidas:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao processar requisição" },
      { status: 500 },
    );
  }
}
