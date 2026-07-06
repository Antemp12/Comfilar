import { db } from "@/db";
import { categoriesTable, materialsTable } from "@/db/schema";
import { validateAdminToken } from "@/lib/auth-api";
import { and, eq, isNull, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * PUT /api/admin/categories/[id]
 * Atualização parcial de uma categoria (admin apenas).
 * Body pode conter qualquer subconjunto de: { name, parentCategoryId, image, isFeatured }
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
    };

    const current = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, categoryId))
      .limit(1);

    if (!current[0]) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    const updates: Partial<typeof categoriesTable.$inferInsert> = {};

    // Nome
    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
      }
      updates.name = name;
    }

    // Imagem
    if (body.image !== undefined) {
      updates.image =
        typeof body.image === "string" && body.image.trim()
          ? body.image.trim()
          : null;
    }

    // Destaque
    if (body.isFeatured !== undefined) {
      updates.isFeatured = Boolean(body.isFeatured);
    }

    // Hierarquia (parentCategoryId)
    if (body.parentCategoryId !== undefined) {
      const newParentId =
        body.parentCategoryId == null ? null : Number(body.parentCategoryId);

      if (newParentId != null) {
        if (Number.isNaN(newParentId)) {
          return NextResponse.json(
            { error: "Categoria-pai inválida" },
            { status: 400 }
          );
        }
        if (newParentId === categoryId) {
          return NextResponse.json(
            { error: "Uma categoria não pode ser pai de si mesma" },
            { status: 400 }
          );
        }
        // O pai tem de ser uma categoria principal (só 2 níveis).
        const parent = await db
          .select()
          .from(categoriesTable)
          .where(eq(categoriesTable.id, newParentId))
          .limit(1);
        if (!parent[0]) {
          return NextResponse.json(
            { error: "Categoria-pai não encontrada" },
            { status: 400 }
          );
        }
        if (parent[0].parentCategoryId != null) {
          return NextResponse.json(
            { error: "Só são permitidos 2 níveis" },
            { status: 400 }
          );
        }
        // Esta categoria não pode virar subcategoria se já tiver subcategorias.
        const children = await db
          .select({ id: categoriesTable.id })
          .from(categoriesTable)
          .where(eq(categoriesTable.parentCategoryId, categoryId))
          .limit(1);
        if (children.length > 0) {
          return NextResponse.json(
            { error: "Esta categoria tem subcategorias e não pode passar a subcategoria" },
            { status: 400 }
          );
        }
      }
      updates.parentCategoryId = newParentId;
    }

    // Verificar duplicados no nível-alvo, se nome ou pai mudaram.
    if (updates.name !== undefined || updates.parentCategoryId !== undefined) {
      const targetName = updates.name ?? current[0].name;
      const targetParent =
        updates.parentCategoryId !== undefined
          ? updates.parentCategoryId
          : current[0].parentCategoryId;

      const siblings = await db
        .select()
        .from(categoriesTable)
        .where(
          and(
            targetParent == null
              ? isNull(categoriesTable.parentCategoryId)
              : eq(categoriesTable.parentCategoryId, targetParent),
            ne(categoriesTable.id, categoryId),
          ),
        );
      if (siblings.some((c: { name: string }) => c.name.toLowerCase() === targetName.toLowerCase())) {
        return NextResponse.json(
          { error: "Já existe uma categoria com esse nome neste nível" },
          { status: 409 }
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nada para atualizar" },
        { status: 400 }
      );
    }

    await db
      .update(categoriesTable)
      .set(updates)
      .where(eq(categoriesTable.id, categoryId));

    const updated = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, categoryId))
      .limit(1);

    return NextResponse.json({ success: true, data: updated[0] }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Erro ao atualizar categoria: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Elimina uma categoria (admin apenas).
 * Bloqueado se tiver subcategorias ou materiais associados — para evitar
 * o cascade destrutivo do schema (que apagaria materiais em cadeia).
 */
export async function DELETE(
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

  const user = await validateAdminToken(request);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const existing = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, categoryId))
      .limit(1);
    if (!existing[0]) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Guarda 1: tem subcategorias?
    const subs = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.parentCategoryId, categoryId))
      .limit(1);
    if (subs.length > 0) {
      return NextResponse.json(
        { error: "Esta categoria tem subcategorias. Elimina-as primeiro." },
        { status: 409 }
      );
    }

    // Guarda 2: tem materiais associados?
    const mats = await db
      .select({ id: materialsTable.id })
      .from(materialsTable)
      .where(eq(materialsTable.categoryId, categoryId))
      .limit(1);
    if (mats.length > 0) {
      return NextResponse.json(
        { error: "Esta categoria tem materiais associados. Move-os para outra categoria primeiro." },
        { status: 409 }
      );
    }

    await db.delete(categoriesTable).where(eq(categoriesTable.id, categoryId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao eliminar categoria:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Erro ao eliminar categoria: ${message}` },
      { status: 500 }
    );
  }
}
