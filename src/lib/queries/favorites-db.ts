import { and, eq } from "drizzle-orm";

import { db } from "~/db";
import { categoriesTable, favoritesTable, materialsTable } from "~/db/schema";

export const getFavoritesForUser = async (userId: number) => {
  return db
    .select({
      id: favoritesTable.id,
      userId: favoritesTable.userId,
      materialId: favoritesTable.materialId,
      createdAt: favoritesTable.createdAt,
      material: {
        id: materialsTable.id,
        name: materialsTable.name,
        price: materialsTable.price,
        image: materialsTable.image,
        stock: materialsTable.stock,
        categoryId: materialsTable.categoryId,
      },
      category: {
        id: categoriesTable.id,
        name: categoriesTable.name,
      },
    })
    .from(favoritesTable)
    .leftJoin(materialsTable, eq(favoritesTable.materialId, materialsTable.id))
    .leftJoin(categoriesTable, eq(materialsTable.categoryId, categoriesTable.id))
    .where(eq(favoritesTable.userId, userId));
};

export const addFavorite = async (userId: number, materialId: number) => {
  const existing = await db
    .select({ id: favoritesTable.id })
    .from(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.materialId, materialId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  return db.insert(favoritesTable).values({
    userId,
    materialId,
  });
};

export const removeFavorite = async (userId: number, materialId: number) => {
  return db
    .delete(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.materialId, materialId),
      ),
    );
};
