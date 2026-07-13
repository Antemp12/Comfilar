import { NextRequest, NextResponse } from "next/server";
import { getResolvedCategoryAttributes } from "~/lib/queries/category-attributes-mysql";

/**
 * GET /api/categories/:id/attributes
 * Atributos dinâmicos (filtros) de uma categoria, já com herança da categoria-mãe.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (!categoryId || isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, message: "ID de categoria inválido" },
        { status: 400 }
      );
    }

    const attributes = await getResolvedCategoryAttributes(categoryId);

    return NextResponse.json(
      { success: true, data: attributes },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar atributos:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar atributos",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
