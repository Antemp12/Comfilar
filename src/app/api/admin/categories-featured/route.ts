import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { categoriesTable } from "~/db/schema";
import { validateAdminToken } from "~/lib/auth-api";

/**
 * PUT /api/admin/categories-featured
 * Atualizar quais categorias aparecem como featured
 * Body: { categoryIds: number[] }
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

    const { categoryIds } = await request.json() as { categoryIds: number[] };

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { success: false, message: "categoryIds deve ser um array" },
        { status: 400 }
      );
    }

    if (categoryIds.length > 4) {
      return NextResponse.json(
        { success: false, message: "Máximo 4 categorias em destaque permitido" },
        { status: 400 }
      );
    }

    // Se é funcionário, verificar se o admin atualizou recentemente
    if (user.type === "funcionario") {
      const adminRecentChanges = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.managedBy, "admin"));

      if (adminRecentChanges.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Não é possível alterar. O administrador tem prioridade nas decisões de categorias em destaque." 
          },
          { status: 403 }
        );
      }
    }

    // Remover featured de todas as categorias principais
    const allCategories = await db.select().from(categoriesTable);
    const mainCategoryIds = allCategories
      .filter((cat) => cat.parentCategoryId === null || !cat.parentCategoryId)
      .map((cat) => cat.id);

    for (const categoryId of mainCategoryIds) {
      await db
        .update(categoriesTable)
        .set({ isFeatured: false })
        .where(eq(categoriesTable.id, categoryId));
    }

    // Marcar como featured apenas as selecionadas
    for (const categoryId of categoryIds) {
      await db
        .update(categoriesTable)
        .set({ isFeatured: true, managedBy: user.type })
        .where(eq(categoriesTable.id, categoryId));
    }

    console.log(`✅ Categorias featured atualizadas por ${user.type}:`, categoryIds);

    return NextResponse.json({
      success: true,
      message: "Categorias atualizadas com sucesso",
      data: { featuredCategoryIds: categoryIds },
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar categorias featured:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar categorias" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/categories-featured
 * Obter todas as categorias com status de featured
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

    const allCategories = await db.select().from(categoriesTable);

    console.log(`📋 Total categories found: ${allCategories.length}`);
    if (allCategories.length > 0) {
      console.log(`📋 Sample category:`, allCategories[0]);
    }

    // Retornar apenas categorias principais (sem parentCategoryId ou null)
    const mainCategories = allCategories.filter(
      (cat) => cat.parentCategoryId === null || !cat.parentCategoryId
    );

    console.log(`📋 Main categories found: ${mainCategories.length}`);
    
    const responseData = mainCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      isFeatured: cat.isFeatured || false,
    }));
    
    console.log(`📋 Response data:`, responseData);

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar categorias:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar categorias" },
      { status: 500 }
    );
  }
}
