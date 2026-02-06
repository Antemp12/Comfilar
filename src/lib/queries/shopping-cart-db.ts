import { eq, and } from "drizzle-orm";
import { db } from "~/db";
import { shoppingCart, materialsTable } from "~/db/schema";

export const getCartForUser = async (userId: number) => {
  return db
    .select({
      id: shoppingCart.id,
      userId: shoppingCart.userId,
      materialId: shoppingCart.materialId,
      quantity: shoppingCart.quantity,
      createdAt: shoppingCart.createdAt,
      updatedAt: shoppingCart.updatedAt,
      material: {
        id: materialsTable.id,
        name: materialsTable.name,
        price: materialsTable.price,
        image: materialsTable.image,
        stock: materialsTable.stock,
      },
    })
    .from(shoppingCart)
    .leftJoin(materialsTable, eq(shoppingCart.materialId, materialsTable.id))
    .where(eq(shoppingCart.userId, userId));
};

export const addToCart = async (
  userId: number,
  materialId: number,
  quantity: number,
) => {
  const existing = await db
    .select()
    .from(shoppingCart)
    .where(
      and(
        eq(shoppingCart.userId, userId),
        eq(shoppingCart.materialId, materialId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return db
      .update(shoppingCart)
      .set({
        quantity: existing[0].quantity + quantity,
        updatedAt: new Date(),
      })
      .where(eq(shoppingCart.id, existing[0].id));
  }

  return db.insert(shoppingCart).values({
    userId,
    materialId,
    quantity,
  });
};

export const updateCartQuantity = async (
  userId: number,
  materialId: number,
  quantity: number,
) => {
  if (quantity <= 0) {
    return removeFromCart(userId, materialId);
  }

  return db
    .update(shoppingCart)
    .set({
      quantity,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(shoppingCart.userId, userId),
        eq(shoppingCart.materialId, materialId),
      ),
    );
};

export const removeFromCart = async (userId: number, materialId: number) => {
  return db
    .delete(shoppingCart)
    .where(
      and(
        eq(shoppingCart.userId, userId),
        eq(shoppingCart.materialId, materialId),
      ),
    );
};

export const clearCart = async (userId: number) => {
  return db.delete(shoppingCart).where(eq(shoppingCart.userId, userId));
};
