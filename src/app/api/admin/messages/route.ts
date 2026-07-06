import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  notifyAllCustomers,
} from "~/lib/notifications-service";
import { getTokenFromHeader, validateToken, getUserById } from "~/lib/auth-comfilar";

/**
 * POST /api/admin/messages
 * Envia uma mensagem (notificação do tipo "mensagem") a um cliente ou a todos.
 * Só admin/funcionário.
 * Body: { target: "user" | "all", userId?: number, title: string, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader =
      request.headers.get("authorization") ?? request.headers.get("Authorization");
    const token =
      getTokenFromHeader(authHeader) ?? request.cookies.get("auth_token")?.value ?? null;
    const decoded = token ? validateToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 });
    }
    const sender = await getUserById(decoded.userId);
    if (!sender || (sender.type !== "admin" && sender.type !== "funcionario")) {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 });
    }

    const body = (await request.json()) as {
      target?: "user" | "all";
      userId?: number;
      title?: string;
      message?: string;
    };

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const target = body.target === "all" ? "all" : "user";

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "Título e mensagem são obrigatórios" },
        { status: 400 },
      );
    }

    if (target === "all") {
      const count = await notifyAllCustomers({ type: "mensagem", title, message });
      return NextResponse.json(
        { success: true, sentTo: count, message: `Mensagem enviada a ${count} cliente(s)` },
        { status: 201 },
      );
    }

    // target === "user"
    const userId = Number(body.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Cliente inválido" },
        { status: 400 },
      );
    }
    const recipient = await getUserById(userId);
    if (!recipient) {
      return NextResponse.json(
        { success: false, message: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    await createNotification({ userId, type: "mensagem", title, message });
    return NextResponse.json(
      { success: true, sentTo: 1, message: "Mensagem enviada" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao enviar mensagem" },
      { status: 500 },
    );
  }
}
