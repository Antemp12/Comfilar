import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { categoryAttributesTable } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { validateAdminToken } from "~/lib/auth-api";

/**
 * DELETE /api/admin/cleanup-attributes
 * Remove atributos duplicados mantendo apenas o primeiro de cada tipo
 */
export async function DELETE(req: NextRequest) {
  const user = await validateAdminToken(req);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    // Buscar todos os atributos
    const allAttributes = await db
      .select()
      .from(categoryAttributesTable);

    // Agrupar por categoryId e attributeName
    const grouped = new Map<string, typeof allAttributes>();
    const toDelete: number[] = [];

    for (const attr of allAttributes) {
      const key = `${attr.categoryId}_${attr.attributeName}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      
      grouped.get(key)!.push(attr);
    }

    // Marcar duplicados para deleção (manter apenas o primeiro)
    for (const [_, attrs] of grouped.entries()) {
      if (attrs.length > 1) {
        // Manter o primeiro, deletar os restantes
        for (let i = 1; i < attrs.length; i++) {
          toDelete.push(attrs[i].id);
        }
      }
    }

    // Deletar os duplicados
    for (const id of toDelete) {
      await db
        .delete(categoryAttributesTable)
        .where(eq(categoryAttributesTable.id, id));
    }

    return NextResponse.json({
      success: true,
      message: `${toDelete.length} atributos duplicados removidos`,
      deletedIds: toDelete,
    });
  } catch (error) {
    console.error("Erro ao limpar atributos duplicados:", error);
    return NextResponse.json(
      { error: "Erro ao limpar atributos duplicados" },
      { status: 500 }
    );
  }
}
