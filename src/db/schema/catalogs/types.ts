import { catalogsTable } from "./tables";

export type Catalog = typeof catalogsTable.$inferSelect;
export type NewCatalog = typeof catalogsTable.$inferInsert;
