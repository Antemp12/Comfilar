import { db } from "@/db";
import {
  categoriesTable,
  materialImagesTable,
  type MaterialVariant,
  type MaterialWithCategory,
  materialsTable,
  materialVariantsTable,
  priceTypesTable,
} from "@/db/schema";
import { eq, asc, desc, like, and, gte, lte, count, inArray, type SQL } from "drizzle-orm";
import { normalizeMaterialImages, type MaterialImageInput } from "~/lib/material-images";

// ============================================
// FILTROS PARTILHADOS
// ============================================

export type MaterialSortBy = "name" | "price" | "stock" | "updatedAt";
export type SortOrder = "asc" | "desc";

export interface MaterialFilterOptions {
  categoryId?: number;
  /** Filtrar por várias categorias em simultâneo (OR). */
  categoryIds?: number[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  inStockOnly?: boolean;
}

/**
 * Constrói as condições WHERE partilhadas pela listagem e pela contagem,
 * garantindo que ambas usam exatamente os mesmos filtros.
 */
function buildMaterialConditions(options: MaterialFilterOptions = {}): SQL[] {
  const { categoryId, categoryIds, search, minPrice, maxPrice, featuredOnly, inStockOnly } =
    options;

  const conditions: SQL[] = [eq(materialsTable.isDeleted, false)];

  // Filtro por várias categorias tem prioridade; senão usa a única (compatibilidade).
  if (categoryIds && categoryIds.length > 0) {
    conditions.push(inArray(materialsTable.categoryId, categoryIds));
  } else if (categoryId) {
    conditions.push(eq(materialsTable.categoryId, categoryId));
  }
  if (search) {
    // MySQL: `like` é case-insensitive com a collation por defeito (utf8mb4_..._ci)
    conditions.push(like(materialsTable.name, `%${search}%`));
  }
  if (minPrice !== undefined) {
    conditions.push(gte(materialsTable.price, minPrice.toString()));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(materialsTable.price, maxPrice.toString()));
  }
  if (featuredOnly) {
    conditions.push(eq(materialsTable.isFeatured, true));
  }
  if (inStockOnly) {
    conditions.push(gte(materialsTable.stock, 1));
  }

  return conditions;
}

/**
 * Conta o total de materiais que correspondem aos filtros (para paginação).
 */
export async function countMaterials(
  options: MaterialFilterOptions = {},
): Promise<number> {
  const conditions = buildMaterialConditions(options);
  const result = await db
    .select({ total: count() })
    .from(materialsTable)
    .where(and(...conditions));

  return result[0]?.total ?? 0;
}

// ============================================
// MATERIAL IMAGES (1 a 3 por produto)
// ============================================

// Reexporta a lógica pura de imagens (mantém compatibilidade com quem importa daqui).
export type { MaterialImageInput };
export { normalizeMaterialImages };

/**
 * Devolve as imagens de um material, ordenadas (por-defeito primeiro).
 */
export async function getMaterialImages(materialId: number) {
  return db
    .select()
    .from(materialImagesTable)
    .where(eq(materialImagesTable.materialId, materialId))
    .orderBy(desc(materialImagesTable.isDefault), asc(materialImagesTable.ordem));
}

/**
 * Substitui todas as imagens de um material pela lista fornecida (máx. 3).
 * Garante exatamente uma imagem por-defeito e devolve o URL dessa imagem
 * (para manter `material.image` em sincronia, por compatibilidade).
 */
export async function setMaterialImages(
  materialId: number,
  images: MaterialImageInput[],
): Promise<string> {
  const { rows, defaultUrl } = normalizeMaterialImages(images);

  await db
    .delete(materialImagesTable)
    .where(eq(materialImagesTable.materialId, materialId));

  if (rows.length === 0) return "";

  await db.insert(materialImagesTable).values(
    rows.map((r) => ({
      materialId,
      url: r.url,
      ordem: r.ordem,
      isDefault: r.isDefault,
    })),
  );

  return defaultUrl;
}

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
  options?: MaterialFilterOptions & {
    limit?: number;
    offset?: number;
    sortBy?: MaterialSortBy;
    sortOrder?: SortOrder;
    includeVariants?: boolean;
  },
): Promise<MaterialWithCategory[]> {
  const {
    limit = 50,
    offset = 0,
    sortBy = "name",
    sortOrder = "asc",
    includeVariants = true,
    ...filters
  } = options || {};

  const conditions = buildMaterialConditions(filters);

  const sortColumns = {
    name: materialsTable.name,
    price: materialsTable.price,
    stock: materialsTable.stock,
    updatedAt: materialsTable.updatedAt,
  } as const;
  const sortColumn = sortColumns[sortBy] ?? materialsTable.name;
  const orderByClause = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

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
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // Na listagem do admin não precisamos das variantes — evita o N+1.
  if (!includeVariants) {
    return materials.map((item: any) => ({
      ...item.material,
      category: item.categoria || { id: 0, name: "Uncategorized" },
      priceType: item.tipo_preco || null,
      variants: [],
    }));
  }

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
