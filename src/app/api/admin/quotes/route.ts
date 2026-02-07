import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import {
  quoteRequestsTable,
  quoteItemsTable,
  materialsTable,
  utilizadorTable,
} from "~/db/schema";
import { desc, eq } from "drizzle-orm";
import { getTokenFromHeader, validateToken, getUserById } from "~/lib/auth-comfilar";

/**
 * GET /api/admin/quotes
 * Listar todos os orcamentos do sistema (admin only)
 * Retorna lista com status, usuario, data e items
 */
export async function GET(request: NextRequest) {
  try {
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

    const quotes = await db
      .select({
        id: quoteRequestsTable.id,
        userId: quoteRequestsTable.userId,
        status: quoteRequestsTable.status,
        date: quoteRequestsTable.date,
      })
      .from(quoteRequestsTable)
      .orderBy(desc(quoteRequestsTable.date));

    const data = await Promise.all(
      quotes.map(async (quote: any) => {
        const items = await db
          .select({
            quantity: quoteItemsTable.quantity,
            price: materialsTable.price,
          })
          .from(quoteItemsTable)
          .leftJoin(
            materialsTable,
            eq(quoteItemsTable.materialId, materialsTable.id),
          )
          .where(eq(quoteItemsTable.quoteId, quote.id));

        const total = items.reduce(
          (sum: number, item: any) =>
            sum +
            (parseInt(item.quantity?.toString() || "0") *
              parseFloat(item.price?.toString() || "0")),
          0,
        );

        const userRows = await db
          .select({
            name: utilizadorTable.name,
            email: utilizadorTable.email,
          })
          .from(utilizadorTable)
          .where(eq(utilizadorTable.id, quote.userId))
          .limit(1);

        const user = userRows[0];

        return {
          id: quote.id,
          userId: quote.userId,
          quoteNumber: `ORC-${String(quote.id).padStart(5, "0")}`,
          customerName: user?.name || "Desconhecido",
          customerEmail: user?.email || "Desconhecido",
          status: quote.status,
          total,
          items: items.length,
          createdAt: quote.date,
        };
      }),
    );

    return NextResponse.json(
      { success: true, data },
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
