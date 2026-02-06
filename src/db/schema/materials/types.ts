import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  materialsTable,
  categoriesTable,
  priceTypesTable,
} from "./tables";
import {
  quoteRequestsTable,
  quoteItemsTable,
  ordersTable,
  meetingsTable,
} from "../comfilar/tables";

// Materials
export type Material = InferSelectModel<typeof materialsTable>;
export type NewMaterial = InferInsertModel<typeof materialsTable>;

export type Category = InferSelectModel<typeof categoriesTable>;
export type NewCategory = InferInsertModel<typeof categoriesTable>;

export type PriceType = InferSelectModel<typeof priceTypesTable>;
export type NewPriceType = InferInsertModel<typeof priceTypesTable>;

// Quote Requests
export type QuoteRequest = InferSelectModel<typeof quoteRequestsTable>;
export type NewQuoteRequest = InferInsertModel<typeof quoteRequestsTable>;

export type QuoteItem = InferSelectModel<typeof quoteItemsTable>;
export type NewQuoteItem = InferInsertModel<typeof quoteItemsTable>;

// Orders
export type Order = InferSelectModel<typeof ordersTable>;
export type NewOrder = InferInsertModel<typeof ordersTable>;

// Meetings
export type Meeting = InferSelectModel<typeof meetingsTable>;
export type NewMeeting = InferInsertModel<typeof meetingsTable>;

// Union types for status
export type QuoteStatus =
  | "pending"
  | "analyzing"
  | "approved"
  | "rejected"
  | "converted";
export type OrderStatus = "processing" | "preparation" | "sent" | "delivered";
