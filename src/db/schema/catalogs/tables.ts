import {
  text,
  timestamp,
  varchar,
  int,
  mysqlTable,
} from "drizzle-orm/mysql-core";

export const catalogsTable = mysqlTable("catalogs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  order: int("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
