import {
  text,
  timestamp,
  varchar,
  integer,
  pgTable,
} from "drizzle-orm/pg-core";

export const catalogsTable = pgTable("catalogs", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
