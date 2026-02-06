import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { categoriesTable } from "~/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/categories/[id]
 * Obter detalhes de uma categoria
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, message: "ID inválido" },
        { status: 400 },
      );
    }

    const category = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, categoryId))
      .limit(1);

    if (!category[0]) {
      return NextResponse.json(
        { success: false, message: "Categoria não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: category[0].id,
          name: category[0].name,
          description: category[0].description,
          createdAt: category[0].createdAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar categoria" },
      { status: 500 },
    );
  }
}
