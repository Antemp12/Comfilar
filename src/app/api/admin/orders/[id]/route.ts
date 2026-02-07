import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { ordersTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromHeader, validateToken, getUserById } from "~/lib/auth-comfilar";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * DELETE /api/admin/orders/[id]
 * Eliminar encomenda (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: "ID inválido" },
        { status: 400 },
      );
    }

    // Tentar obter token do header Authorization
    const authHeader = request.headers.get("authorization");
    let token = getTokenFromHeader(authHeader);

    // Se não houver no header, tentar do cookie
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

    // Eliminar encomenda
    await db.delete(ordersTable).where(eq(ordersTable.id, orderId));

    return NextResponse.json(
      {
        success: true,
        message: "Encomenda eliminada com sucesso",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao eliminar encomenda:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao eliminar encomenda" },
      { status: 500 },
    );
  }
}
