import { relations } from "drizzle-orm";
import {
  materialsTable,
  categoriesTable,
} from "./tables";
import {
  quoteRequestsTable,
  quoteItemsTable,
  ordersTable,
  meetingsTable,
} from "../comfilar/tables";
import { userTable } from "../users/tables";

// Materials Relations
export const materialsRelations = relations(materialsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [materialsTable.categoryId],
    references: [categoriesTable.id],
  }),
  quoteItems: many(quoteItemsTable),
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  materials: many(materialsTable),
}));

// Quote Relations
export const quoteRequestsRelations = relations(
  quoteRequestsTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [quoteRequestsTable.userId],
      references: [userTable.id],
    }),
    items: many(quoteItemsTable),
    order: one(ordersTable),
  })
);

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

// Order Relations
export const ordersRelations = relations(ordersTable, ({ one }) => ({
  user: one(userTable, {
    fields: [ordersTable.userId],
    references: [userTable.id],
  }),
  quote: one(quoteRequestsTable, {
    fields: [ordersTable.quoteId],
    references: [quoteRequestsTable.id],
  }),
}));

// Meeting Relations
export const meetingsRelations = relations(meetingsTable, ({ one }) => ({
  client: one(userTable, {
    fields: [meetingsTable.userId],
    references: [userTable.id],
    relationName: "clientMeetings",
  }),
  employee: one(userTable, {
    fields: [meetingsTable.employeeId],
    references: [userTable.id],
    relationName: "employeeMeetings",
  }),
}));
