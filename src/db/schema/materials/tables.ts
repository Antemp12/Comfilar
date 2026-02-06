import {
  integer,
  pgTable,
  text,
  timestamp,
  decimal,
  varchar,
} from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const materialsTable = pgTable("materials", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  categoryId: text("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "restrict" }),
  image: text("image"),
  specifications: text("specifications"), // JSON field for technical specs
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const priceTypesTable = pgTable("price_types", {
  id: text("id").primaryKey(),
  type: varchar("type", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
