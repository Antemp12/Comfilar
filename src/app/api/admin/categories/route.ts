import { db } from "@/db";
import { categoriesTable } from "@/db/schema";
import { validateAdminToken } from "@/lib/auth-api";
import { eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/categories
 * Criar uma categoria principal ou subcategoria (admin apenas).
 * Body: { name, parentCategoryId?, image?, isFeatured? }
 * Regra: só 2 níveis — o pai de uma subcategoria tem de ser uma categoria principal.
 */
export async function POST(request: NextRequest) {
  const user = await validateAdminToken(request);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      name?: unknown;
      parentCategoryId?: unknown;
      image?: unknown;
      isFeatured?: unknown;
      isActive?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const parentCategoryId =
      body.parentCategoryId != null ? Number(body.parentCategoryId) : null;
    const image = typeof body.image === "string" && body.image.trim() ? body.image.trim() : null;
    const isFeatured = Boolean(body.isFeatured);
    const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

    if (!name) {
      return NextResponse.json(
        { error: "O nome da categoria é obrigatório" },
        { status: 400 },
      );
    }

    // Se for subcategoria, o pai tem de existir e ser uma categoria principal.
    if (parentCategoryId != null) {
      if (Number.isNaN(parentCategoryId)) {
        return NextResponse.json(
          { error: "Categoria-pai inválida" },
          { status: 400 },
        );
      }
      const parent = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, parentCategoryId))
        .limit(1);

      if (!parent[0]) {
        return NextResponse.json(
          { error: "Categoria-pai não encontrada" },
          { status: 400 },
        );
      }
      if (parent[0].parentCategoryId != null) {
        return NextResponse.json(
          { error: "Só são permitidos 2 níveis: uma subcategoria não pode ter subcategorias" },
          { status: 400 },
        );
      }
    }

    // Evitar nomes duplicados no mesmo nível.
    const siblings = await db
      .select()
      .from(categoriesTable)
      .where(
        parentCategoryId == null
          ? isNull(categoriesTable.parentCategoryId)
          : eq(categoriesTable.parentCategoryId, parentCategoryId),
      );
    if (siblings.some((c: { name: string }) => c.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json(
        { error: "Já existe uma categoria com esse nome neste nível" },
        { status: 409 },
      );
    }

    const result = await db.insert(categoriesTable).values({
      name,
      parentCategoryId,
      image,
      isFeatured,
      isActive,
    });

    return NextResponse.json(
      { success: true, id: (result as unknown as { insertId: number }).insertId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Erro ao criar categoria: ${message}` },
      { status: 500 },
    );
  }
}
