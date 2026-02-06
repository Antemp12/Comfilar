import type {
  categoriesTable,
  materialsTable,
  materialVariantsTable,
  meetingsTable,
  ordersTable,
  priceTypesTable,
  quoteItemsTable,
  quoteRequestsTable,
  utilizadorTable,
} from "./tables-mysql";

// ============================================
// ENUMS
// ============================================

export const QuoteStatus = {
  PENDENTE: "pendente",
  ANALISE: "analise",
  APROVADO: "aprovado",
  REJEITADO: "rejeitado",
  CONVERTIDO: "convertido",
} as const;

export const OrderStatus = {
  PROCESSAMENTO: "processamento",
  PREPARACAO: "preparacao",
  ENVIADO: "enviado",
  ENTREGUE: "entregue",
} as const;

export const UserType = {
  CLIENTE: "cliente",
  FUNCIONARIO: "funcionario",
  ADMIN: "admin",
} as const;

export const PriceTypeEnum = {
  UNITARIO: "unitario",
  M2: "m2",
  LITRO: "litro",
  KG: "kg",
  M3: "m3",
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type QuoteStatusType = (typeof QuoteStatus)[keyof typeof QuoteStatus];
export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];
export type UserTypeType = (typeof UserType)[keyof typeof UserType];
export type PriceTypeType = (typeof PriceTypeEnum)[keyof typeof PriceTypeEnum];

// ============================================
// TABLE TYPES
// ============================================

export type PriceType = typeof priceTypesTable.$inferSelect;
export type NewPriceType = typeof priceTypesTable.$inferInsert;

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;

export type Material = typeof materialsTable.$inferSelect;
export type NewMaterial = typeof materialsTable.$inferInsert;

export type MaterialVariant = typeof materialVariantsTable.$inferSelect;
export type NewMaterialVariant = typeof materialVariantsTable.$inferInsert;

export type Utilizador = typeof utilizadorTable.$inferSelect;
export type NewUtilizador = typeof utilizadorTable.$inferInsert;

export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;
export type NewQuoteRequest = typeof quoteRequestsTable.$inferInsert;

export type QuoteItem = typeof quoteItemsTable.$inferSelect;
export type NewQuoteItem = typeof quoteItemsTable.$inferInsert;

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;

export type Meeting = typeof meetingsTable.$inferSelect;
export type NewMeeting = typeof meetingsTable.$inferInsert;

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================

export interface MaterialWithCategory extends Material {
  category: Category;
  priceType: PriceType | null;
  variants: MaterialVariant[];
}

export interface QuoteRequestWithDetails extends QuoteRequest {
  user: Utilizador;
  items: QuoteItemWithMaterial[];
}

export interface QuoteItemWithMaterial extends QuoteItem {
  material: Material;
}

export interface OrderWithQuote extends Order {
  quote: QuoteRequestWithDetails;
}

export interface MeetingWithUser extends Meeting {
  user: Utilizador;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface QuoteCalculation {
  subtotal: number;
  transportCost: number;
  total: number;
  estimatedDeliveryDays: number;
}

export interface MaterialsListResponse {
  materials: MaterialWithCategory[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QuotesListResponse {
  quotes: QuoteRequestWithDetails[];
  total: number;
  page: number;
  pageSize: number;
}
