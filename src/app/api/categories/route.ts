import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { categoriesTable } from "~/db/schema";
import { and, eq, isNull } from "drizzle-orm";

/**
 * GET /api/categories
 * Listar categorias de materiais
 * Opcoes: mainOnly=true (apenas principais), hierarchy=true (com subcategorias)
 * Suporta categorias hierarquicas com grupos e subgrupos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mainOnly = searchParams.get("mainOnly") === "true";
    const hierarchy = searchParams.get("hierarchy") === "true";
    // Por defeito só devolvemos categorias ativas (o que os clientes veem).
    // O admin passa includeInactive=true para ver e gerir também as desativadas.
    const includeInactive = searchParams.get("includeInactive") === "true";
    // Condição de "ativa": is_active = 1 (registos antigos foram preenchidos com 1).
    const activeOnly = eq(categoriesTable.isActive, true);

    if (mainOnly) {
      // Retornar apenas categorias principais (sem parentCategoryId)
      const mainCategories = await db
        .select()
        .from(categoriesTable)
        .where(
          includeInactive
            ? isNull(categoriesTable.parentCategoryId)
            : and(isNull(categoriesTable.parentCategoryId), activeOnly),
        );

      return NextResponse.json(
        {
          success: true,
          data: mainCategories.map((c: typeof mainCategories[0]) => ({
            id: c.id,
            name: c.name,
            parentCategoryId: c.parentCategoryId,
          })),
        },
        { status: 200 },
      );
    }

    if (hierarchy) {
      // Buscar categorias principais
      const mainCategories = await db
        .select()
        .from(categoriesTable)
        .where(
          includeInactive
            ? isNull(categoriesTable.parentCategoryId)
            : and(isNull(categoriesTable.parentCategoryId), activeOnly),
        );

      // Buscar todas as subcategorias (filtradas por estado, salvo no modo admin)
      const allSubcategories = await db
        .select()
        .from(categoriesTable)
        .where(includeInactive ? undefined : activeOnly);

      // Montar hierarquia
      const categoriesWithSubs = mainCategories.map((main: typeof mainCategories[0]) => ({
        id: main.id,
        name: main.name,
        parentCategoryId: null,
        image: main.image,
        isFeatured: main.isFeatured || false,
        isActive: main.isActive ?? true,
        subcategories: allSubcategories
          .filter((sub: typeof allSubcategories[0]) => sub.parentCategoryId === main.id)
          .map((sub: typeof allSubcategories[0]) => ({
            id: sub.id,
            name: sub.name,
            parentCategoryId: sub.parentCategoryId,
            image: sub.image,
            isFeatured: sub.isFeatured || false,
            isActive: sub.isActive ?? true,
          })),
      }));

      return NextResponse.json(
        {
          success: true,
          data: categoriesWithSubs,
        },
        { status: 200 },
      );
    }

    // Retornar todas as categorias (sem hierarquia)
    const categories = await db
      .select()
      .from(categoriesTable)
      .where(includeInactive ? undefined : activeOnly);

    return NextResponse.json(
      {
        success: true,
        data: categories.map((c: typeof categories[0]) => ({
          id: c.id,
          name: c.name,
          parentCategoryId: c.parentCategoryId,
          image: c.image,
          isFeatured: c.isFeatured || false,
          isActive: c.isActive ?? true,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao listar categorias" },
      { status: 500 },
    );
  }
}
