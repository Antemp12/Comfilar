import { db } from "@/db";
import { categoriesTable } from "@/db/schema";
import { validateAdminToken } from "@/lib/auth-api";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * PUT /api/admin/categories/[id]
 * Atualizar categoria (admin apenas)
 * Pode editar nome, descricao e hierarquia
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    return NextResponse.json(
      { error: "ID de categoria inválido" },
      { status: 400 }
    );
  }

  // Validar token
  const tokenCheck = await validateAdminToken(request);
  if (tokenCheck.error) {
    return NextResponse.json({ error: tokenCheck.error }, { status: 401 });
  }

  try {
    const { image } = await request.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "URL de imagem inválida" },
        { status: 400 }
      );
    }

    // Atualizar categoria
    await db
      .update(categoriesTable)
      .set({ image })
      .where(eq(categoriesTable.id, categoryId));

    // Buscar categoria atualizada
    const updated = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, categoryId))
      .limit(1);

    if (!updated.length) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Erro ao atualizar categoria: ${errorMessage}` },
      { status: 500 }
    );
  }
}
