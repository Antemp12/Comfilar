import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { materialsTable, materialVariantsTable } from "~/db/schema";
import { inArray } from "drizzle-orm";
import { validateAdminToken } from "~/lib/auth-api";

type BulkAction = "soft-delete" | "hard-delete" | "feature" | "unfeature";
const ACTIONS: readonly BulkAction[] = [
  "soft-delete",
  "hard-delete",
  "feature",
  "unfeature",
];

/**
 * POST /api/materials/bulk
 * Ações em lote sobre materiais (admin apenas).
 * Body: { ids: number[], action: "soft-delete" | "hard-delete" | "feature" | "unfeature" }
 */
export async function POST(request: NextRequest) {
  const user = await validateAdminToken(request);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ success: false, message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { ids?: unknown; action?: unknown };

    const ids = Array.isArray(body.ids)
      ? body.ids.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n > 0)
      : [];
    const action = body.action as BulkAction;

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Nenhum material selecionado" },
        { status: 400 },
      );
    }
    if (!ACTIONS.includes(action)) {
      return NextResponse.json(
        { success: false, message: "Ação inválida" },
        { status: 400 },
      );
    }

    switch (action) {
      case "soft-delete":
        await db
          .update(materialsTable)
          .set({ isDeleted: true })
          .where(inArray(materialsTable.id, ids));
        break;
      case "hard-delete":
        // Remove variantes primeiro (as imagens caem por cascade da FK).
        await db
          .delete(materialVariantsTable)
          .where(inArray(materialVariantsTable.materialId, ids));
        await db.delete(materialsTable).where(inArray(materialsTable.id, ids));
        break;
      case "feature":
        await db
          .update(materialsTable)
          .set({ isFeatured: true })
          .where(inArray(materialsTable.id, ids));
        break;
      case "unfeature":
        await db
          .update(materialsTable)
          .set({ isFeatured: false })
          .where(inArray(materialsTable.id, ids));
        break;
    }

    return NextResponse.json(
      { success: true, affected: ids.length },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro na ação em lote:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao aplicar ação em lote" },
      { status: 500 },
    );
  }
}
