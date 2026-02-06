import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { materialsTable } from "~/db/schema";
import { validateAdminToken } from "~/lib/auth-middleware";

/**
 * PUT /api/admin/products-featured
 * Atualizar quais produtos aparecem como featured
 * Body: { productIds: number[] }
 */
export async function PUT(request: NextRequest) {
  try {
    // Validar admin ou funcionário
    const user = await validateAdminToken(request);
    if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      );
    }

    const { productIds } = await request.json() as { productIds: number[] };

    if (!Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, message: "productIds deve ser um array" },
        { status: 400 }
      );
    }

    // Se é funcionário, verificar se o admin atualizou recentemente
    if (user.type === "funcionario") {
      const adminRecentChanges = await db
        .select()
        .from(materialsTable)
        .where(eq(materialsTable.managedBy, "admin"));

      if (adminRecentChanges.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Não é possível alterar. O administrador tem prioridade nas decisões de produtos em destaque." 
          },
          { status: 403 }
        );
      }
    }

    // Remover featured de todos os produtos
    await db
      .update(materialsTable)
      .set({ isFeatured: false });

    // Marcar como featured apenas os selecionados
    for (const productId of productIds) {
      await db
        .update(materialsTable)
        .set({ isFeatured: true, managedBy: user.type })
        .where(eq(materialsTable.id, productId));
    }

    console.log(`✅ Produtos featured atualizados por ${user.type}:`, productIds);

    return NextResponse.json({
      success: true,
      message: "Produtos atualizados com sucesso",
      data: { featuredProductIds: productIds },
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar produtos featured:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar produtos" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/products-featured
 * Obter todos os produtos com status de featured
 */
export async function GET(request: NextRequest) {
  try {
    // Validar admin ou funcionário
    const user = await validateAdminToken(request);
    if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      );
    }

    const allProducts = await db.select().from(materialsTable);

    return NextResponse.json({
      success: true,
      data: allProducts.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        isFeatured: product.isFeatured,
      })),
    });
  } catch (error) {
    console.error("❌ Erro ao buscar produtos:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}
