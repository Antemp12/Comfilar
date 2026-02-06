import { db } from "~/db";
import {
  categoryAttributesTable,
} from "~/db/schema";
import { eq } from "drizzle-orm";

/**
 * Buscar todos os atributos de uma categoria
 */
export async function getCategoryAttributes(categoryId: number) {
  try {
    const attributes = await db
      .select()
      .from(categoryAttributesTable)
      .where(eq(categoryAttributesTable.categoryId, categoryId));

    return attributes;
  } catch (error) {
    console.error("Erro ao buscar atributos da categoria:", error);
    return [];
  }
}

