import { mysqlTable, varchar, longtext, int, timestamp } from "drizzle-orm/mysql-core";

export const catalogsTable = mysqlTable("catalogs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: longtext("image_url").notNull(),
  description: longtext("description"),
  order: int("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type Catalog = typeof catalogsTable.$inferSelect;
export type NewCatalog = typeof catalogsTable.$inferInsert;
