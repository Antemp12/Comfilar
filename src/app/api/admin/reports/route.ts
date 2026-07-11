import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import {
  ordersTable,
  orderItemsTable,
  utilizadorTable,
  materialsTable,
  categoriesTable,
} from "~/db/schema";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { validateAdminToken } from "~/lib/auth-api";

const LOW_STOCK_THRESHOLD = 10;

/**
 * GET /api/admin/reports
 * Relatórios de vendas e atividade (dados reais da BD).
 * Query: period=week|month|quarter|year|all (default=month)
 */
export async function GET(req: NextRequest) {
  const user = await validateAdminToken(req);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    // Data de início do período selecionado.
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        startDate = new Date("2000-01-01");
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const revenueExpr = sql<number>`sum(${orderItemsTable.quantity} * ${orderItemsTable.unitPrice})`;

    // Total de clientes registados.
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(utilizadorTable)
      .where(eq(utilizadorTable.type, "cliente"));

    // Encomendas no período.
    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordersTable)
      .where(gte(ordersTable.confirmationDate, startDate));

    // Receita total no período (soma dos itens das encomendas).
    const revenueRow = await db
      .select({ revenue: sql<number>`coalesce(${revenueExpr}, 0)` })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
      .where(gte(ordersTable.confirmationDate, startDate));
    const totalRevenue = Number(revenueRow[0]?.revenue || 0);

    // Encomendas por estado (no período).
    const ordersByStatus = await db
      .select({ status: ordersTable.status, count: sql<number>`count(*)` })
      .from(ordersTable)
      .where(gte(ordersTable.confirmationDate, startDate))
      .groupBy(ordersTable.status);

    // Top 5 materiais mais vendidos (no período).
    const topProducts = await db
      .select({
        materialId: orderItemsTable.materialId,
        totalQuantity: sql<number>`sum(${orderItemsTable.quantity})`,
        totalRevenue: revenueExpr,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
      .where(gte(ordersTable.confirmationDate, startDate))
      .groupBy(orderItemsTable.materialId)
      .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
      .limit(5);

    const topProductsWithNames = await Promise.all(
      topProducts.map(async (product: { materialId: number; totalQuantity: number; totalRevenue: number }) => {
        const material = await db
          .select({ name: materialsTable.name })
          .from(materialsTable)
          .where(eq(materialsTable.id, product.materialId))
          .limit(1);
        return {
          name: material[0]?.name || "Desconhecido",
          sales: Number(product.totalQuantity),
          revenue: Math.round(Number(product.totalRevenue)),
        };
      }),
    );

    // Receita real por mês (últimos 6 meses).
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthRows = await db
      .select({
        ym: sql<string>`DATE_FORMAT(${ordersTable.confirmationDate}, '%Y-%m')`,
        revenue: revenueExpr,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
      .where(gte(ordersTable.confirmationDate, sixMonthsAgo))
      .groupBy(sql`DATE_FORMAT(${ordersTable.confirmationDate}, '%Y-%m')`);
    const monthMap = new Map<string, number>(
      monthRows.map((r: { ym: string; revenue: number }) => [r.ym, Number(r.revenue)]),
    );

    const revenueByMonth: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenueByMonth.push({
        month: d.toLocaleDateString("pt-PT", { month: "short" }),
        revenue: Math.round(monthMap.get(ym) ?? 0),
      });
    }

    // Receita por categoria (no período).
    const catRows = await db
      .select({ category: categoriesTable.name, revenue: revenueExpr })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
      .innerJoin(materialsTable, eq(orderItemsTable.materialId, materialsTable.id))
      .leftJoin(categoriesTable, eq(materialsTable.categoryId, categoriesTable.id))
      .where(gte(ordersTable.confirmationDate, startDate))
      .groupBy(categoriesTable.name)
      .orderBy(desc(revenueExpr))
      .limit(6);
    const revenueByCategory = catRows.map((r: { category: string | null; revenue: number }) => ({
      category: r.category || "Sem categoria",
      revenue: Math.round(Number(r.revenue)),
    }));

    // Materiais com stock baixo/esgotado (independente do período).
    const lowStockProducts = await db
      .select({ name: materialsTable.name, stock: materialsTable.stock })
      .from(materialsTable)
      .where(
        and(
          eq(materialsTable.isDeleted, false),
          lte(materialsTable.stock, LOW_STOCK_THRESHOLD),
        ),
      )
      .orderBy(materialsTable.stock)
      .limit(10);

    const lowStockCountRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(materialsTable)
      .where(
        and(
          eq(materialsTable.isDeleted, false),
          lte(materialsTable.stock, LOW_STOCK_THRESHOLD),
        ),
      );

    return NextResponse.json({
      success: true,
      data: {
        period,
        totalRevenue: Math.round(totalRevenue),
        totalOrders: Number(totalOrders[0]?.count || 0),
        totalUsers: Number(totalUsers[0]?.count || 0),
        lowStockCount: Number(lowStockCountRow[0]?.count || 0),
        topProducts: topProductsWithNames,
        revenueByMonth,
        revenueByCategory,
        ordersByStatus: ordersByStatus.map((o: { status: string; count: number }) => ({
          status: o.status,
          count: Number(o.count),
        })),
        lowStockProducts: lowStockProducts.map((p: { name: string; stock: number | null }) => ({
          name: p.name,
          stock: Number(p.stock ?? 0),
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatórios:", error);
    return NextResponse.json({ error: "Erro ao gerar relatórios" }, { status: 500 });
  }
}
