import { NextRequest, NextResponse } from "next/server";
import { markAllNotificationsAsRead } from "@/lib/notifications-service";
import { getTokenFromHeader, validateToken } from "@/lib/auth-comfilar";

/**
 * PATCH /api/notifications/read-all
 * Marcar TODAS as notificacoes do utilizador autenticado como lidas.
 */
export async function PATCH(request: NextRequest) {
  try {
    const authHeader =
      request.headers.get("authorization") ?? request.headers.get("Authorization");
    const token =
      getTokenFromHeader(authHeader) ?? request.cookies.get("auth_token")?.value ?? null;
    const decoded = token ? validateToken(token) : null;
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Não autenticado" },
        { status: 401 },
      );
    }

    await markAllNotificationsAsRead(decoded.userId);

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
