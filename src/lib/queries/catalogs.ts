import { db } from "@/db";
import { catalogsTable } from "@/db/schema/catalogs";
import { desc } from "drizzle-orm";

export async function getAllCatalogs() {
  try {
    const catalogs = await db
      .select()
      .from(catalogsTable)
      .orderBy(desc(catalogsTable.order), desc(catalogsTable.createdAt));
    return catalogs;
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return [];
  }
}

export async function getCatalogById(id: string) {
  try {
    const catalog = await db
      .select()
      .from(catalogsTable)
      .where((t) => t.id === id)
      .limit(1);
    return catalog[0] || null;
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return null;
  }
}
