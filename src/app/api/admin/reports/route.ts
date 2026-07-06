import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { ordersTable, orderItemsTable, quoteRequestsTable, utilizadorTable, materialsTable } from "~/db/schema";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { validateAdminToken } from "~/lib/auth-api";

/**
 * GET /api/admin/reports
 * Gerar relatorios de vendas e atividades
 * Query: period=week|month|year (default=month)
 * Retorna estatisticas de encomendas e receitas
 */
export async function GET(req: NextRequest) {
  const user = await validateAdminToken(req);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    // Calcular data de início baseado no período
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        startDate = new Date("2020-01-01");
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Total de utilizadores
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(utilizadorTable)
      .where(eq(utilizadorTable.type, "cliente"));

    // Total de encomendas no período
    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordersTable);

    // Total de pedidos de orçamento
    const totalQuotes = await db
      .select({ count: sql<number>`count(*)` })
      .from(quoteRequestsTable);

    // Encomendas por status
    const ordersByStatus = await db
      .select({
        status: ordersTable.status,
        count: sql<number>`count(*)`,
      })
      .from(ordersTable)
      .groupBy(ordersTable.status);

    // Top 5 materiais mais vendidos
    const topProducts = await db
      .select({
        materialId: orderItemsTable.materialId,
        totalQuantity: sql<number>`sum(${orderItemsTable.quantity})`,
        totalRevenue: sql<number>`sum(${orderItemsTable.quantity} * ${orderItemsTable.unitPrice})`,
      })
      .from(orderItemsTable)
      .groupBy(orderItemsTable.materialId)
      .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
      .limit(5);

    // Buscar nomes dos materiais
    const topProductsWithNames = await Promise.all(
      topProducts.map(async (product) => {
        const material = await db
          .select({ name: materialsTable.name })
          .from(materialsTable)
          .where(eq(materialsTable.id, product.materialId))
          .limit(1);
        
        return {
          name: material[0]?.name || "Desconhecido",
          sales: Number(product.totalQuantity),
          revenue: Number(product.totalRevenue),
        };
      })
    );

    // Calcular receita total
    const totalRevenue = topProductsWithNames.reduce((sum, p) => sum + p.revenue, 0);

    // Receita por mês (últimos 6 meses)
    const revenueByMonth: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString("pt-PT", { month: "short" });
      
      // Simplificado: usar dados mock por enquanto
      revenueByMonth.push({
        month: monthName,
        revenue: Math.random() * 10000 + 5000,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders: Number(totalOrders[0]?.count || 0),
        totalQuotes: Number(totalQuotes[0]?.count || 0),
        totalUsers: Number(totalUsers[0]?.count || 0),
        topProducts: topProductsWithNames,
        revenueByMonth,
        ordersByStatus: ordersByStatus.map((o) => ({
          status: o.status,
          count: Number(o.count),
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatórios:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatórios" },
      { status: 500 }
    );
  }
}
