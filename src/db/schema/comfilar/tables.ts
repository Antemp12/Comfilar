import {
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { userTable } from "../users/tables";
import { materialsTable } from "../materials/tables";

export const quoteRequestsTable = pgTable("quote_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, analyzing, approved, rejected, converted
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quoteItemsTable = pgTable("quote_items", {
  id: text("id").primaryKey(),
  quoteId: text("quote_id")
    .notNull()
    .references(() => quoteRequestsTable.id, { onDelete: "cascade" }),
  materialId: text("material_id")
    .notNull()
    .references(() => materialsTable.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  quoteId: text("quote_id")
    .notNull()
    .unique()
    .references(() => quoteRequestsTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("processing"), // processing, preparation, sent, delivered
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  transportCost: decimal("transport_cost", { precision: 10, scale: 2 }).notNull(),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  confirmedAt: timestamp("confirmed_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const meetingsTable = pgTable("meetings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  employeeId: text("employee_id")
    .references(() => userTable.id, { onDelete: "set null" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
