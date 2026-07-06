import { NextRequest, NextResponse } from "next/server";
import { getCategoryAttributes } from "~/lib/queries/category-attributes-mysql";

/**
 * GET /api/categories/:id/attributes
 * Busca atributos dinâmicos de uma categoria
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

    const attributes = await getCategoryAttributes(categoryId);


    return NextResponse.json(
      {
        success: true,
        data: attributes.map((attr: typeof attributes[0]) => ({
          id: attr.id,
          name: attr.attributeName,
          values: Array.isArray(attr.attributeValues) 
            ? attr.attributeValues 
            : JSON.parse(attr.attributeValues as string),
        })),
      },
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
