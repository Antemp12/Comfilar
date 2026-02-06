import { relations } from "drizzle-orm";
import {
  categoriesTable,
  materialsTable,
  materialVariantsTable,
  meetingsTable,
  notificationsTable,
  ordersTable,
  orderItemsTable,
  priceTypesTable,
  quoteItemsTable,
  quoteRequestsTable,
  utilizadorTable,
} from "./tables-mysql";

// ============================================
// PRICE TYPES RELATIONS
// ============================================
export const priceTypesRelations = relations(priceTypesTable, ({ many }) => ({
  materials: many(materialsTable),
}));

// ============================================
// CATEGORIES RELATIONS
// ============================================
export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  materials: many(materialsTable),
}));

// ============================================
// MATERIALS RELATIONS
// ============================================
export const materialsRelations = relations(materialsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [materialsTable.categoryId],
    references: [categoriesTable.id],
  }),
  priceType: one(priceTypesTable, {
    fields: [materialsTable.priceTypeId],
    references: [priceTypesTable.id],
  }),
  variants: many(materialVariantsTable),
  quoteItems: many(quoteItemsTable),
}));

// ============================================
// MATERIAL VARIANTS RELATIONS
// ============================================
export const materialVariantsRelations = relations(
  materialVariantsTable,
  ({ one }) => ({
    material: one(materialsTable, {
      fields: [materialVariantsTable.materialId],
      references: [materialsTable.id],
    }),
  }),
);

// ============================================
// UTILIZADOR (USER) RELATIONS
// ============================================
export const utilizadorRelations = relations(utilizadorTable, ({ many }) => ({
  quotes: many(quoteRequestsTable),
  meetings: many(meetingsTable),
}));

// ============================================
// QUOTE REQUESTS RELATIONS
// ============================================
export const quoteRequestsRelations = relations(
  quoteRequestsTable,
  ({ one, many }) => ({
    user: one(utilizadorTable, {
      fields: [quoteRequestsTable.userId],
      references: [utilizadorTable.id],
    }),
    items: many(quoteItemsTable),
    order: one(ordersTable),
  }),
);

// ============================================
// QUOTE ITEMS RELATIONS
// ============================================
export const quoteItemsRelations = relations(quoteItemsTable, ({ one }) => ({
  quote: one(quoteRequestsTable, {
    fields: [quoteItemsTable.quoteId],
    references: [quoteRequestsTable.id],
  }),
  material: one(materialsTable, {
    fields: [quoteItemsTable.materialId],
    references: [materialsTable.id],
  }),
}));

// ============================================
// ORDERS RELATIONS
// ============================================
export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  quote: one(quoteRequestsTable, {
    fields: [ordersTable.quoteId],
    references: [quoteRequestsTable.id],
  }),
  items: many(orderItemsTable),
}));

// ============================================
// ORDER ITEMS RELATIONS
// ============================================
export const orderItemsRelations = relations(
  orderItemsTable,
  ({ one }) => ({
    order: one(ordersTable, {
      fields: [orderItemsTable.orderId],
      references: [ordersTable.id],
    }),
    material: one(materialsTable, {
      fields: [orderItemsTable.materialId],
      references: [materialsTable.id],
    }),
    variant: one(materialVariantsTable, {
      fields: [orderItemsTable.variantId],
      references: [materialVariantsTable.id],
    }),
  }),
);

// ============================================
// MEETINGS RELATIONS
// ============================================
export const meetingsRelations = relations(meetingsTable, ({ one }) => ({
  user: one(utilizadorTable, {
    fields: [meetingsTable.userId],
    references: [utilizadorTable.id],
  }),
}));

// ============================================
// NOTIFICATIONS RELATIONS
// ============================================
export const notificationsRelations = relations(
  notificationsTable,
  ({ one }) => ({
    user: one(utilizadorTable, {
      fields: [notificationsTable.userId],
      references: [utilizadorTable.id],
    }),
  }),
);
