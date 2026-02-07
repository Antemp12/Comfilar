import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications-service";
import { getTokenFromHeader, validateToken, getUserById } from "@/lib/auth-comfilar";

/**
 * GET /api/notifications
 * Obter notificacoes do utilizador autenticado
 * Mostra alertas, mensagens e promocoes
 * Filtros: unreadOnly=true, limit (50), offset (0)
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

/**
 * POST /api/notifications
 * Criar notificacao (apenas admin/funcionarios)
 * Requer autenticacao valida com role apropriado
 * Body: { userId, type, title, message, relatedId? }
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
    let token = getTokenFromHeader(authHeader);

    if (!token) {
      token = request.cookies.get("auth_token")?.value ?? null;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Não autenticado" },
        { status: 401 },
      );
    }

    const decoded = validateToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token inválido" },
        { status: 401 },
      );
    }

    const sender = await getUserById(decoded.userId);
    if (!sender || (sender.type !== "admin" && sender.type !== "funcionario")) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      userId?: number;
      type?: "mensagem" | "sistema" | "promocao";
      title?: string;
      message?: string;
      relatedId?: number;
    };

    if (!body.userId || !body.type || !body.title || !body.message) {
      return NextResponse.json(
        { success: false, message: "Dados inválidos" },
        { status: 400 },
      );
    }

    const created = await createNotification({
      userId: body.userId,
      type: body.type,
      title: body.title,
      message: body.message,
      relatedId: body.relatedId,
    });

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao criar notificação" },
      { status: 500 },
    );
  }
}
