import { db } from "@/db";
import {
  categoriesTable,
  type MaterialVariant,
  type MaterialWithCategory,
  materialsTable,
  materialVariantsTable,
  priceTypesTable,
} from "@/db/schema";
import { eq, asc, desc, ilike, and } from "drizzle-orm";

// ============================================
// MATERIAL QUERIES WITH VARIANTS
// ============================================

/**
 * Busca material com variações
 */
export async function getMaterialWithVariants(
  id: number,
): Promise<MaterialWithCategory | null> {
  const material = await db
    .select()
    .from(materialsTable)
    .where(and(
      eq(materialsTable.id, id),
      eq(materialsTable.isDeleted, false) // Filtrar deletados
    ))
    .leftJoin(
      categoriesTable,
      eq(materialsTable.categoryId, categoriesTable.id),
    )
    .leftJoin(
      priceTypesTable,
      eq(materialsTable.priceTypeId, priceTypesTable.id),
    )
    .limit(1);

  if (!material[0]) {
    return null;
  }

  const variants = await db
    .select()
    .from(materialVariantsTable)
    .where(eq(materialVariantsTable.materialId, id));

  return {
    ...material[0].material,
    category: material[0].categoria!,
    priceType: material[0].tipo_preco,
    variants,
  };
}

/**
 * Listar materiais com variações e filtros
 */
export async function getMaterialsWithVariants(
  options?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  },
): Promise<MaterialWithCategory[]> {
  const { categoryId, search, minPrice, maxPrice, limit = 50, offset = 0 } =
    options || {};

  const conditions = [eq(materialsTable.isDeleted, false)]; // Sempre filtrar deletados

  if (categoryId) {
    conditions.push(eq(materialsTable.categoryId, categoryId));
  }

  if (search) {
    conditions.push(
      ilike(materialsTable.name, `%${search}%`),
    );
  }

  const materials = await db
    .select()
    .from(materialsTable)
    .where(and(...conditions))
    .leftJoin(
      categoriesTable,
      eq(materialsTable.categoryId, categoriesTable.id),
    )
    .leftJoin(
      priceTypesTable,
      eq(materialsTable.priceTypeId, priceTypesTable.id),
    )
    .orderBy(asc(materialsTable.name))
    .limit(limit)
    .offset(offset);

  console.log(`📦 Found ${materials.length} materials for query:`, {
    categoryId,
    search,
    limit,
    offset,
  });

  // Buscar variantes para cada material (if table exists)
  const result: MaterialWithCategory[] = [];

  for (const item of materials) {
    let variants: MaterialVariant[] = [];
    
    try {
      variants = await db
        .select()
        .from(materialVariantsTable)
        .where(eq(materialVariantsTable.materialId, item.material.id));
    } catch (error) {
      console.warn(`⚠️ Could not fetch variants for material ${item.material.id}:`, error instanceof Error ? error.message : 'Unknown error');
      // Continue without variants if table doesn't exist
      variants = [];
    }

    result.push({
      ...item.material,
      category: item.categoria || { id: 0, name: "Uncategorized" },
      priceType: item.tipo_preco || null,
      variants,
    });
  }

  return result;
}

/**
 * Buscar materiais em destaque
 */
export async function getFeaturedMaterials(
  limit: number = 6,
): Promise<MaterialWithCategory[]> {
  const materials = await db
    .select()
    .from(materialsTable)
    .where(and(
      eq(materialsTable.isFeatured, true),
      eq(materialsTable.isDeleted, false)
    ))
    .leftJoin(
      categoriesTable,
      eq(materialsTable.categoryId, categoriesTable.id),
    )
    .leftJoin(
      priceTypesTable,
      eq(materialsTable.priceTypeId, priceTypesTable.id),
    )
    .orderBy(desc(materialsTable.updatedAt))
    .limit(limit);

  const result: MaterialWithCategory[] = [];

  for (const item of materials) {
    let variants: MaterialVariant[] = [];
    
    try {
      variants = await db
        .select()
        .from(materialVariantsTable)
        .where(eq(materialVariantsTable.materialId, item.material.id));
    } catch (error) {
      variants = [];
    }

    result.push({
      ...item.material,
      category: item.categoria || { id: 0, name: "Uncategorized" },
      priceType: item.tipo_preco || null,
      variants,
    });
  }

  return result;
}

/**
 * Buscar variantes de um material
 */
export async function getVariantsByMaterialId(
  materialId: number,
): Promise<MaterialVariant[]> {
  return await db
    .select()
    .from(materialVariantsTable)
    .where(eq(materialVariantsTable.materialId, materialId))
    .orderBy(asc(materialVariantsTable.name));
}

/**
 * Buscar variante específica
 */
export async function getVariantById(id: number): Promise<MaterialVariant | null> {
  const result = await db
    .select()
    .from(materialVariantsTable)
    .where(eq(materialVariantsTable.id, id))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Atualizar stock total do material (somar variantes)
 */
export async function updateMaterialTotalStock(materialId: number): Promise<void> {
  // Somar stock de todas as variantes
  const variants = await db
    .select()
    .from(materialVariantsTable)
    .where(eq(materialVariantsTable.materialId, materialId));

  const totalStock = variants.reduce((sum: number, v: MaterialVariant) => sum + (v.stock ?? 0), 0);

  // Atualizar stock do material
  await db
    .update(materialsTable)
    .set({ stock: totalStock })
    .where(eq(materialsTable.id, materialId));
}

/**
 * Verificar se variante tem stock
 */
export async function checkVariantStock(
  variantId: number,
  quantity: number,
): Promise<boolean> {
  const variant = await getVariantById(variantId);
  return variant ? ((variant.stock ?? 0) >= quantity) : false;
}

/**
 * Reduzir stock de variante
 */
export async function reduceVariantStock(
  variantId: number,
  quantity: number,
): Promise<boolean> {
  try {
    const variant = await getVariantById(variantId);
    const currentStock = variant?.stock ?? 0;
    if (!variant || currentStock < quantity) {
      return false;
    }

    await db
      .update(materialVariantsTable)
      .set({ stock: currentStock - quantity })
      .where(eq(materialVariantsTable.id, variantId));

    // Atualizar stock total do material
    await updateMaterialTotalStock(variant.materialId);

    return true;
  } catch (error) {
    console.error("Erro ao reduzir stock:", error);
    return false;
  }
}

/**
 * Restaurar stock de variante
 */
export async function restoreVariantStock(
  variantId: number,
  quantity: number,
): Promise<boolean> {
  try {
    const variant = await getVariantById(variantId);
    if (!variant) {
      return false;
    }

    await db
      .update(materialVariantsTable)
      .set({ stock: (variant.stock ?? 0) + quantity })
      .where(eq(materialVariantsTable.id, variantId));

    // Atualizar stock total do material
    await updateMaterialTotalStock(variant.materialId);

    return true;
  } catch (error) {
    console.error("Erro ao restaurar stock:", error);
    return false;
  }
}
