import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { quoteRequestsTable, ordersTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getQuoteRequestById } from "~/lib/queries/comfilar-mysql";

/**
 * GET /api/quotes/[id]
 * Obter detalhes de um orçamento
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json(
        { success: false, message: "ID inválido" },
        { status: 400 },
      );
    }

    const quote = await getQuoteRequestById(quoteId);

    if (!quote) {
      return NextResponse.json(
        { success: false, message: "Orçamento não encontrado" },
        { status: 404 },
      );
    }

    // Calcular totais dinamicamente
    const subtotal = quote.items.reduce((sum, item) => {
      const price = item.material ? parseFloat(item.material.price as any) : 0;
      return sum + (price * item.quantity);
    }, 0);
    const transportCost = subtotal > 500 ? 0 : 50;
    const total = subtotal + transportCost;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: quote.id,
          userId: quote.userId,
          date: quote.date,
          status: quote.status,
          subtotal,
          transportCost,
          total,
          user: {
            id: quote.user.id,
            name: quote.user.name,
            email: quote.user.email,
          },
          items: quote.items.map((item) => ({
            id: item.id,
            materialId: item.materialId,
            quantity: item.quantity,
            material: item.material
              ? {
                  id: item.material.id,
                  name: item.material.name,
                  price: parseFloat(item.material.price as any),
                }
              : null,
          })),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar orçamento" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/quotes/[id]
 * Atualizar status do orçamento
 * Body: { status: "pendente" | "aprovado" | "rejeitado" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json(
        { success: false, message: "ID inválido" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as { status?: string };
    const validStatuses = ["pendente", "aprovado", "rejeitado"];

    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status inválido. Deve ser: " + validStatuses.join(", "),
        },
        { status: 400 },
      );
    }

    // Verificar se orçamento existe
    const quote = await getQuoteRequestById(quoteId);
    if (!quote) {
      return NextResponse.json(
        { success: false, message: "Orçamento não encontrado" },
        { status: 404 },
      );
    }

    // Atualizar status
    await db
      .update(quoteRequestsTable)
      .set({ status: body.status })
      .where(eq(quoteRequestsTable.id, quoteId));

    return NextResponse.json(
      {
        success: true,
        message: "Status atualizado com sucesso",
      },
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

/**
 * POST /api/quotes/[id]/convert
 * Converter orçamento aprovado em encomenda
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json(
        { success: false, message: "ID inválido" },
        { status: 400 },
      );
    }

    // Verificar se orçamento existe e está aprovado
    const quote = await getQuoteRequestById(quoteId);
    if (!quote) {
      return NextResponse.json(
        { success: false, message: "Orçamento não encontrado" },
        { status: 404 },
      );
    }

    if (quote.status !== "aprovado") {
      return NextResponse.json(
        {
          success: false,
          message: "Apenas orçamentos aprovados podem ser convertidos",
        },
        { status: 400 },
      );
    }

    // Verificar se já existe encomenda
    const existingOrder = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.quoteId, quoteId))
      .limit(1);

    if (existingOrder[0]) {
      return NextResponse.json(
        { success: false, message: "Orçamento já convertido em encomenda" },
        { status: 400 },
      );
    }

    // Criar encomenda
    const [order] = await db
      .insert(ordersTable)
      .values({
        quoteId: quoteId,
        status: "processamento",
        confirmationDate: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Encomenda criada com sucesso",
        data: {
          orderId: order.id,
          quoteId: order.quoteId,
          status: order.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao converter orçamento:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao converter orçamento" },
      { status: 500 },
    );
  }
}
