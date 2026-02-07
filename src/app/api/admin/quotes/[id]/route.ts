import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { quoteRequestsTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromHeader, validateToken, getUserById } from "~/lib/auth-comfilar";
import { createNotification } from "~/lib/notifications-service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/admin/quotes/[id]
 * Atualizar status do orçamento (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string };
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID do orçamento é obrigatório" },
        { status: 400 },
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status é obrigatório" },
        { status: 400 },
      );
    }

    const validStatuses = ["pendente", "analise", "aprovado", "rejeitado", "convertido"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status inválido" },
        { status: 400 },
      );
    }

    // Autenticação (header ou cookie)
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

    const admin = await getUserById(decoded.userId);
    if (!admin || admin.type !== "admin") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    // Atualizar status
    await db
      .update(quoteRequestsTable)
      .set({ status: status as any })
      .where(eq(quoteRequestsTable.id, parseInt(id, 10)));

    // Buscar quote para obter userId
    const quoteRows = await db
      .select({ id: quoteRequestsTable.id, userId: quoteRequestsTable.userId })
      .from(quoteRequestsTable)
      .where(eq(quoteRequestsTable.id, parseInt(id, 10)))
      .limit(1);

    const quote = quoteRows[0];
    if (quote) {
      if (status === "aprovado") {
        await createNotification({
          userId: quote.userId,
          type: "sistema",
          title: "Orçamento aprovado",
          message: `O seu orçamento #${quote.id} foi aprovado.`,
          relatedId: quote.id,
        });
      }

      if (status === "rejeitado") {
        await createNotification({
          userId: quote.userId,
          type: "sistema",
          title: "Orçamento rejeitado",
          message: `O seu orçamento #${quote.id} foi rejeitado.`,
          relatedId: quote.id,
        });
      }
    }

    return NextResponse.json(
      { success: true, message: "Status atualizado" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar orçamento" },
      { status: 500 },
    );
  }
}
