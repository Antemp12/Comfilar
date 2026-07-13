import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import {
  ordersTable,
  orderItemsTable,
  materialsTable,
  categoriesTable,
  quoteRequestsTable,
  utilizadorTable,
} from "~/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromHeader, validateToken, getUserById } from "~/lib/auth-comfilar";

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token =
    getTokenFromHeader(authHeader) ?? request.cookies.get("auth_token")?.value ?? null;
  if (!token) return { error: "Não autenticado", status: 401 as const };
  const decoded = validateToken(token);
  if (!decoded) return { error: "Token inválido", status: 401 as const };
  const admin = await getUserById(decoded.userId);
  if (!admin || (admin.type !== "admin" && admin.type !== "funcionario")) {
    return { error: "Acesso negado", status: 403 as const };
  }
  return { admin };
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/orders/[id]
 * Detalhe da encomenda (admin) — itens por join manual (sem relational query).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ success: false, message: "ID inválido" }, { status: 400 });
  }

  const [order] = await db
    .select({
      id: ordersTable.id,
      quoteId: ordersTable.quoteId,
      status: ordersTable.status,
      confirmationDate: ordersTable.confirmationDate,
      estimatedDelivery: ordersTable.estimatedDelivery,
    })
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) {
    return NextResponse.json({ success: false, message: "Encomenda não encontrada" }, { status: 404 });
  }

  const items = await db
    .select({
      id: orderItemsTable.id,
      quantity: orderItemsTable.quantity,
      unitPrice: orderItemsTable.unitPrice,
      materialId: orderItemsTable.materialId,
      materialName: materialsTable.name,
      materialImage: materialsTable.image,
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
    })
    .from(orderItemsTable)
    .leftJoin(materialsTable, eq(orderItemsTable.materialId, materialsTable.id))
    .leftJoin(categoriesTable, eq(materialsTable.categoryId, categoriesTable.id))
    .where(eq(orderItemsTable.orderId, orderId));

  let customerName = "Desconhecido";
  let customerEmail = "";
  const [quote] = await db
    .select({ userId: quoteRequestsTable.userId })
    .from(quoteRequestsTable)
    .where(eq(quoteRequestsTable.id, order.quoteId))
    .limit(1);
  if (quote?.userId) {
    const [u] = await db
      .select({ name: utilizadorTable.name, email: utilizadorTable.email })
      .from(utilizadorTable)
      .where(eq(utilizadorTable.id, quote.userId))
      .limit(1);
    if (u) {
      customerName = u.name || "Desconhecido";
      customerEmail = u.email || "";
    }
  }

  const mapped = items.map((it: any) => {
    const qty = Number(it.quantity ?? 0);
    const price = parseFloat(String(it.unitPrice ?? "0")) || 0;
    return {
      id: it.id,
      quantity: qty,
      unitPrice: price,
      subtotal: qty * price,
      material: {
        id: it.materialId,
        name: it.materialName ?? "Material",
        image: it.materialImage ?? null,
        category: { id: it.categoryId ?? 0, name: it.categoryName ?? "—" },
      },
      variant: null,
    };
  });

  const total = mapped.reduce((s: number, it: any) => s + it.subtotal, 0);

  return NextResponse.json({
    success: true,
    data: {
      id: order.id,
      orderNumber: `ORD-${String(order.id).padStart(5, "0")}`,
      status: order.status,
      customerName,
      customerEmail,
      estimatedDelivery: order.estimatedDelivery ?? null,
      createdAt: order.confirmationDate?.toISOString() ?? new Date().toISOString(),
      total,
      items: mapped,
    },
  });
}

/**
 * PATCH /api/admin/orders/[id]
 * Atualiza a data prevista de entrega. Body: { estimatedDelivery: "YYYY-MM-DD" | null }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ success: false, message: "ID inválido" }, { status: 400 });
  }

  const body = (await request.json()) as { estimatedDelivery?: string | null };
  const value =
    typeof body.estimatedDelivery === "string" && body.estimatedDelivery.trim()
      ? body.estimatedDelivery.trim()
      : null;

  await db
    .update(ordersTable)
    .set({ estimatedDelivery: value })
    .where(eq(ordersTable.id, orderId));

  return NextResponse.json({ success: true, estimatedDelivery: value });
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
