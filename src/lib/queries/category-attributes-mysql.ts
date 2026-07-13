import { db } from "~/db";
import { categoryAttributesTable, categoriesTable } from "~/db/schema";
import { eq } from "drizzle-orm";

export type CategoryAttributeType = "select" | "number";

export interface CategoryAttributeInput {
  name: string;
  values: string[];
  type?: CategoryAttributeType;
}

/** Garante que os valores vêm como string[] (podem estar guardados como texto JSON). */
function toValues(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Buscar os atributos PRÓPRIOS de uma categoria (sem herança), sem duplicados.
 */
export async function getCategoryAttributes(categoryId: number) {
  try {
    const attributes = await db
      .select()
      .from(categoryAttributesTable)
      .where(eq(categoryAttributesTable.categoryId, categoryId));

    // Remover duplicados mantendo apenas o primeiro de cada nome de atributo.
    const seen = new Set<string>();
    const unique = attributes.filter((attr: typeof attributes[0]) => {
      const key = attr.attributeName.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique;
  } catch (error) {
    console.error("Erro ao buscar atributos da categoria:", error);
    return [];
  }
}

/**
 * Atributos RESOLVIDOS de uma categoria: os próprios + os herdados da categoria-mãe.
 * Um atributo próprio com o mesmo nome sobrepõe-se ao herdado.
 * Devolve objetos simples { id, name, values } prontos para a API.
 */
export async function getResolvedCategoryAttributes(
  categoryId: number,
): Promise<Array<{ id: number; name: string; values: string[]; type: string }>> {
  const own = await getCategoryAttributes(categoryId);

  // Descobrir a categoria-mãe (se for subcategoria).
  let parentId: number | null = null;
  try {
    const cat = await db
      .select({ parentId: categoriesTable.parentCategoryId })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, categoryId))
      .limit(1);
    parentId = cat[0]?.parentId ?? null;
  } catch {
    parentId = null;
  }

  const inherited = parentId ? await getCategoryAttributes(parentId) : [];

  // Merge por nome (case-insensitive): próprios sobrepõem-se aos herdados.
  const byName = new Map<string, { id: number; name: string; values: string[]; type: string }>();
  for (const a of inherited) {
    byName.set(a.attributeName.toLowerCase(), {
      id: a.id,
      name: a.attributeName,
      values: toValues(a.attributeValues),
      type: (a as { type?: string }).type ?? "select",
    });
  }
  for (const a of own) {
    byName.set(a.attributeName.toLowerCase(), {
      id: a.id,
      name: a.attributeName,
      values: toValues(a.attributeValues),
      type: (a as { type?: string }).type ?? "select",
    });
  }

  return Array.from(byName.values());
}

/**
 * Substitui TODOS os atributos próprios de uma categoria pela lista fornecida.
 * Ignora atributos sem nome ou sem valores.
 */
export async function setCategoryAttributes(
  categoryId: number,
  attrs: CategoryAttributeInput[],
): Promise<void> {
  const rows = attrs
    .map((a) => ({
      name: (a.name ?? "").trim(),
      type: a.type === "number" ? "number" : "select",
      values: Array.from(
        new Set((a.values ?? []).map((v) => v.trim()).filter(Boolean)),
      ),
    }))
    // Filtros de lista precisam de valores; filtros numéricos não.
    .filter((a) => a.name && (a.type === "number" || a.values.length > 0));

  await db
    .delete(categoryAttributesTable)
    .where(eq(categoryAttributesTable.categoryId, categoryId));

  if (rows.length === 0) return;

  await db.insert(categoryAttributesTable).values(
    rows.map((a) => ({
      categoryId,
      attributeName: a.name,
      attributeValues: a.values,
      type: a.type,
    })),
  );
}
