import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { ordersTable, orderItemsTable, quoteRequestsTable, utilizadorTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromHeader, validateToken, getUserById } from "~/lib/auth-comfilar";

/**
 * GET /api/admin/orders
 * Listar todas as encomendas do sistema (admin only)
 * Retorna todas as encomendas com dados do cliente e itens
 */
export async function GET(request: NextRequest) {
  try {
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

    // Buscar todas as encomendas com os seus itens e quote info
    const orders = await db
      .select({
        id: ordersTable.id,
        quoteId: ordersTable.quoteId,
        status: ordersTable.status,
        confirmationDate: ordersTable.confirmationDate,
      })
      .from(ordersTable)
      .orderBy(ordersTable.confirmationDate);

    // Buscar itens e info do cliente para cada encomenda
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const items = await db
          .select({
            id: orderItemsTable.id,
            quantity: orderItemsTable.quantity,
            unitPrice: orderItemsTable.unitPrice,
          })
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));

        // Buscar informações do quote e cliente
        const quote = await db
          .select({
            id: quoteRequestsTable.id,
            userId: quoteRequestsTable.userId,
          })
          .from(quoteRequestsTable)
          .where(eq(quoteRequestsTable.id, order.quoteId));

        let customerName = "Desconhecido";
        let customerEmail = "Desconhecido";

        if (quote[0]) {
          const user = await db
            .select({
              id: utilizadorTable.id,
              name: utilizadorTable.name,
              email: utilizadorTable.email,
            })
            .from(utilizadorTable)
            .where(eq(utilizadorTable.id, quote[0].userId));

          if (user[0]) {
            customerName = user[0].name || "Desconhecido";
            customerEmail = user[0].email || "Desconhecido";
          }
        }

        // Calcular total
        const total = items.reduce(
          (sum: number, item: any) =>
            sum +
            (parseInt(item.quantity?.toString() || "0") *
              parseFloat(item.unitPrice?.toString() || "0")),
          0,
        );

        return {
          id: order.id,
          orderNumber: `ORD-${String(order.id).padStart(5, "0")}`,
          customerName,
          customerEmail,
          status: order.status || "processamento",
          total,
          items: items.length,
          createdAt: order.confirmationDate?.toISOString() || new Date().toISOString(),
        };
      }),
    );

    return NextResponse.json(
      {
        success: true,
        data: ordersWithItems,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao listar encomendas:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao listar encomendas" },
      { status: 500 },
    );
  }
}
