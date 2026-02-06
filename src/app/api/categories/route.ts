import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { categoriesTable } from "~/db/schema";
import { isNull } from "drizzle-orm";

/**
 * GET /api/categories
 * Listar todas as categorias (com hierarquia opcional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hierarchy = searchParams.get("hierarchy") === "true";

    if (hierarchy) {
      // Buscar categorias principais
      const mainCategories = await db
        .select()
        .from(categoriesTable)
        .where(isNull(categoriesTable.parentCategoryId));

      // Buscar todas as subcategorias
      const allSubcategories = await db.select().from(categoriesTable);

      // Montar hierarquia
      const categoriesWithSubs = mainCategories.map((main: typeof mainCategories[0]) => ({
        id: main.id,
        name: main.name,
        parentCategoryId: null,
        subcategories: allSubcategories
          .filter((sub: typeof allSubcategories[0]) => sub.parentCategoryId === main.id)
          .map((sub: typeof allSubcategories[0]) => ({
            id: sub.id,
            name: sub.name,
            parentCategoryId: sub.parentCategoryId,
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
    const categories = await db.select().from(categoriesTable);

    return NextResponse.json(
      {
        success: true,
        data: categories.map((c: typeof categories[0]) => ({
          id: c.id,
          name: c.name,
          parentCategoryId: c.parentCategoryId,
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
