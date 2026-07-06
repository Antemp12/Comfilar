import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { catalogsTable } from "~/db/schema/catalogs";
import { eq } from "drizzle-orm";
import { validateAdminToken } from "~/lib/auth-api";

/**
 * PUT /api/catalogs/[id]
 * Atualizar informacoes de um catalogo especifico (admin)
 * Pode editar: titulo, descricao, imagem, ordem
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateAdminToken(request);
    if (!user || user.type !== "admin") {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json() as {
      title?: string;
      imageUrl?: string;
      description?: string;
      order?: number;
    };


    await db
      .update(catalogsTable)
      .set({
        title: body.title,
        imageUrl: body.imageUrl,
        description: body.description,
        order: body.order,
        updatedAt: new Date(),
      })
      .where(eq(catalogsTable.id, id));

    // Buscar o catálogo atualizado (MySQL não suporta .returning())
    const [updated] = await db
      .select()
      .from(catalogsTable)
      .where(eq(catalogsTable.id, id));

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Catálogo não encontrado" },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      data: updated,
      message: "Catálogo atualizado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar catálogo:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar catálogo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/catalogs/[id]
 * Deletar catálogo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateAdminToken(request);
    if (!user || user.type !== "admin") {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar se existe
    const [existing] = await db
      .select()
      .from(catalogsTable)
      .where(eq(catalogsTable.id, id));

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Catálogo não encontrado" },
        { status: 404 }
      );
    }

    await db
      .delete(catalogsTable)
      .where(eq(catalogsTable.id, id));


    return NextResponse.json({
      success: true,
      message: "Catálogo deletado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao deletar catálogo:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao deletar catálogo" },
      { status: 500 }
    );
  }
}
