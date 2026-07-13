import { mysqlTable, varchar, longtext, int, timestamp, json } from "drizzle-orm/mysql-core";

export const catalogsTable = mysqlTable("catalogs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: longtext("image_url").notNull(),
  description: longtext("description"),
  // "carousel" = imagem única (carrossel do início); "pricelist" = várias páginas (folhear)
  type: varchar("type", { length: 20 }).notNull().default("carousel"),
  // Páginas do catálogo (URLs de imagens) para o tipo "pricelist".
  pages: json("pages").$type<string[]>(),
  // Em alternativa às páginas, um PDF que é renderizado página a página (folhear).
  pdfUrl: longtext("pdf_url"),
  order: int("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type Catalog = typeof catalogsTable.$inferSelect;
export type NewCatalog = typeof catalogsTable.$inferInsert;
