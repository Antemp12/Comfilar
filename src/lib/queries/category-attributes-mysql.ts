import { db } from "~/db";
import {
  categoryAttributesTable,
} from "~/db/schema";
import { eq } from "drizzle-orm";

/**
 * Buscar todos os atributos de uma categoria (sem duplicados)
 */
export async function getCategoryAttributes(categoryId: number) {
  try {
    const attributes = await db
      .select()
      .from(categoryAttributesTable)
      .where(eq(categoryAttributesTable.categoryId, categoryId));

    // Remover duplicados mantendo apenas o primeiro de cada atributo
    const seen = new Set<string>();
    const unique = attributes.filter((attr: typeof attributes[0]) => {
      const key = attr.attributeName;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    return unique;
  } catch (error) {
    console.error("Erro ao buscar atributos da categoria:", error);
    return [];
  }
}

