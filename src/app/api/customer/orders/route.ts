import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { ordersTable, orderItemsTable, materialsTable, categoriesTable } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { getTokenFromHeader, validateToken } from "~/lib/auth-comfilar";

/**
 * GET /api/customer/orders
 * Listar encomendas do cliente autenticado
 * Requer token JWT valido
 * Retorna todas as encomendas pessoais com status
 */
export async function GET(request: NextRequest) {
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

    const userId = decoded.userId as number;

    // Buscar encomendas do utilizador directamente pelo userId
    const orders = await db
      .select({
        id: ordersTable.id,
        quoteId: ordersTable.quoteId,
        status: ordersTable.status,
        confirmationDate: ordersTable.confirmationDate,
        estimatedDelivery: ordersTable.estimatedDelivery,
      })
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.confirmationDate));
    // Para suportar completamente seria necessário adicionar campo userId em ordersTable

    const data = await Promise.all(
      orders.map(async (order: any) => {
        const items = await db
          .select({
            id: orderItemsTable.id,
            orderId: orderItemsTable.orderId,
            materialId: orderItemsTable.materialId,
            quantity: orderItemsTable.quantity,
            unitPrice: orderItemsTable.unitPrice,
            materialName: materialsTable.name,
            materialDescription: materialsTable.description,
            materialPrice: materialsTable.price,
            materialImage: materialsTable.image,
            categoryName: categoriesTable.name,
          })
          .from(orderItemsTable)
          .leftJoin(materialsTable, eq(orderItemsTable.materialId, materialsTable.id))
          .leftJoin(categoriesTable, eq(materialsTable.categoryId, categoriesTable.id))
          .where(eq(orderItemsTable.orderId, order.id));

        const total = items.reduce(
          (sum: number, item: any) =>
            sum +
            (parseFloat(item.quantity?.toString() || "0") *
              parseFloat(item.unitPrice?.toString() || "0")),
          0,
        );

        return {
          id: order.id,
          orderNumber: `ORD-${String(order.id).padStart(5, "0")}`,
          status: order.status || "processamento",
          total,
          items: items.length,
          itemsDetails: items.map((item: any) => ({
            id: item.id,
            orderId: item.orderId,
            materialId: item.materialId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            material: {
              id: item.materialId,
              name: item.materialName,
              description: item.materialDescription,
              price: item.materialPrice,
              image: item.materialImage,
              category: item.categoryName,
            },
          })),
          createdAt: order.confirmationDate?.toISOString() || new Date().toISOString(),
          estimatedDelivery: order.estimatedDelivery ?? null,
        };
      }),
    );

    return NextResponse.json(
      { success: true, data },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar encomendas do cliente:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar encomendas" },
      { status: 500 },
    );
  }
}
