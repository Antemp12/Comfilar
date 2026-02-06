import { int, mysqlTable, timestamp } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

import { userTable } from "../users/tables";
import { materialsTable } from "../comfilar/tables-mysql";

export const shoppingCart = mysqlTable("shopping_cart", {
  id: int().primaryKey().autoincrement(),
  userId: int().notNull(),
  materialId: int().notNull(),
  quantity: int().notNull().default(1),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export const shoppingCartRelations = relations(shoppingCart, ({ one }) => ({
  user: one(userTable, {
    fields: [shoppingCart.userId],
    references: [userTable.id],
  }),
  material: one(materialsTable, {
    fields: [shoppingCart.materialId],
    references: [materialsTable.id],
  }),
}));
