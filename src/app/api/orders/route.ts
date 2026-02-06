import { NextRequest, NextResponse } from "next/server";
import { getAllOrders } from "@/lib/queries/shopping-cart-mysql";

/**
 * GET /api/orders
 * Listar pedidos com filtros opcionais
 * Query params:
 * - status: processamento|preparacao|enviado|entregue
 * - userId: number
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") || undefined;
    const userId = searchParams.get("userId")
      ? parseInt(searchParams.get("userId")!, 10)
      : undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0;

    // Validar status
    const validStatuses = ["processamento", "preparacao", "enviado", "entregue"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status inválido. Deve ser um de: " + validStatuses.join(", "),
        },
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

    // Buscar pedidos
    const orders = await getAllOrders({
      status,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        data: orders.map((order: any) => ({
          id: order.id,
          status: order.status,
          confirmationDate: order.confirmationDate,
          itemsCount: order.items.length,
        })),
        pagination: {
          limit,
          offset,
          total: orders.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao listar pedidos" },
      { status: 500 },
    );
  }
}
