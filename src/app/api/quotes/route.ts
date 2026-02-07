import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { quoteRequestsTable, quoteItemsTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getUserQuoteRequests, getAllQuoteRequests } from "~/lib/queries/comfilar-mysql";

/**
 * GET /api/quotes
 * Listar orcamentos do utilizador ou todos (admin)
 * Retorna resumo com id, usuario, data e status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId")
      ? parseInt(searchParams.get("userId")!, 10)
      : undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0;

    // Validar limites
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: "Limite deve estar entre 1 e 100" },
        { status: 400 },
      );
    }

    // Buscar orçamentos
    const quotes = userId
      ? await getUserQuoteRequests(userId, limit, offset)
      : await getAllQuoteRequests(limit, offset);

    return NextResponse.json(
      {
        success: true,
        data: quotes.map((q) => ({
          id: q.id,
          userId: q.userId,
          date: q.date,
          status: q.status,
        })),
        pagination: {
          limit,
          offset,
          total: quotes.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao listar orçamentos:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao listar orçamentos" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/quotes
 * Criar novo pedido de orçamento
 * Body:
 * {
 *   userId: number,
 *   items: [{ materialId: number, quantity: number }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: number;
      items?: { materialId: number; quantity: number }[];
    };

    if (!body.userId || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, message: "userId e items são obrigatórios" },
        { status: 400 },
      );
    }

    if (body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Deve incluir pelo menos 1 item" },
        { status: 400 },
      );
    }

    // Validar cada item
    for (const item of body.items) {
      if (!item.materialId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Cada item deve ter materialId e quantity > 0",
          },
          { status: 400 },
        );
      }
    }

    // Criar orçamento
    const [quote] = await db
      .insert(quoteRequestsTable)
      .values({
        userId: body.userId,
        date: new Date(),
        status: "pendente",
      })
      .returning();

    // Inserir items
    const quoteItems = await db
      .insert(quoteItemsTable)
      .values(
        body.items.map((item) => ({
          quoteId: quote.id,
          materialId: item.materialId,
          quantity: item.quantity,
        })),
      )
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Orçamento criado com sucesso",
        data: {
          id: quote.id,
          userId: quote.userId,
          date: quote.date,
          status: quote.status,
          itemCount: quoteItems.length,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao criar orçamento" },
      { status: 500 },
    );
  }
}
