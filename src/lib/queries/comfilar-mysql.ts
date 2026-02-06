import { db } from "@/db";
import {
  categoriesTable,
  type Material,
  type MaterialWithCategory,
  materialsTable,
  type MeetingWithUser,
  meetingsTable,
  type Order,
  type OrderWithQuote,
  ordersTable,
  priceTypesTable,
  type QuoteItemWithMaterial,
  quoteItemsTable,
  type QuoteRequest,
  type QuoteRequestWithDetails,
  quoteRequestsTable,
  type Utilizador,
  utilizadorTable,
} from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

// ============================================
// UTILIZADOR (USER) QUERIES
// ============================================

export async function getUtilizadorById(id: number): Promise<Utilizador | null> {
  const result = await db
    .select()
    .from(utilizadorTable)
    .where(eq(utilizadorTable.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function getUtilizadorByEmail(email: string): Promise<Utilizador | null> {
  const result = await db
    .select()
    .from(utilizadorTable)
    .where(eq(utilizadorTable.email, email))
    .limit(1);

  return result[0] ?? null;
}

// ============================================
// MATERIAL QUERIES
// ============================================

export async function getMaterials(
  limit = 50,
  offset = 0,
): Promise<MaterialWithCategory[]> {
  const materials = await db
    .select({
      id: materialsTable.id,
      name: materialsTable.name,
      description: materialsTable.description,
      price: materialsTable.price,
      stock: materialsTable.stock,
      categoryId: materialsTable.categoryId,
      priceTypeId: materialsTable.priceTypeId,
      category: categoriesTable,
      priceType: priceTypesTable,
    })
    .from(materialsTable)
    .leftJoin(
      categoriesTable,
      eq(materialsTable.categoryId, categoriesTable.id),
    )
    .leftJoin(
      priceTypesTable,
      eq(materialsTable.priceTypeId, priceTypesTable.id),
    )
    .limit(limit)
    .offset(offset)
    .orderBy(asc(materialsTable.name));

  return materials as MaterialWithCategory[];
}

export async function getMaterialById(id: number): Promise<MaterialWithCategory | null> {
  const result = await db
    .select({
      id: materialsTable.id,
      name: materialsTable.name,
      description: materialsTable.description,
      price: materialsTable.price,
      stock: materialsTable.stock,
      categoryId: materialsTable.categoryId,
      priceTypeId: materialsTable.priceTypeId,
      category: categoriesTable,
      priceType: priceTypesTable,
    })
    .from(materialsTable)
    .leftJoin(
      categoriesTable,
      eq(materialsTable.categoryId, categoriesTable.id),
    )
    .leftJoin(
      priceTypesTable,
      eq(materialsTable.priceTypeId, priceTypesTable.id),
    )
    .where(eq(materialsTable.id, id))
    .limit(1);

  return (result[0] as MaterialWithCategory) ?? null;
}

export async function getMaterialsByCategory(
  categoryId: number,
  limit = 50,
  offset = 0,
): Promise<MaterialWithCategory[]> {
  const materials = await db
    .select({
      id: materialsTable.id,
      name: materialsTable.name,
      description: materialsTable.description,
      price: materialsTable.price,
      stock: materialsTable.stock,
      categoryId: materialsTable.categoryId,
      priceTypeId: materialsTable.priceTypeId,
      category: categoriesTable,
      priceType: priceTypesTable,
    })
    .from(materialsTable)
    .leftJoin(
      categoriesTable,
      eq(materialsTable.categoryId, categoriesTable.id),
    )
    .leftJoin(
      priceTypesTable,
      eq(materialsTable.priceTypeId, priceTypesTable.id),
    )
    .where(eq(materialsTable.categoryId, categoryId))
    .limit(limit)
    .offset(offset)
    .orderBy(asc(materialsTable.name));

  return materials as MaterialWithCategory[];
}

// ============================================
// QUOTE QUERIES
// ============================================

export async function getUserQuoteRequests(
  userId: number,
  limit = 50,
  offset = 0,
): Promise<QuoteRequest[]> {
  return await db
    .select()
    .from(quoteRequestsTable)
    .where(eq(quoteRequestsTable.userId, userId))
    .orderBy(desc(quoteRequestsTable.date))
    .limit(limit)
    .offset(offset);
}

export async function getQuoteRequestById(
  id: number,
): Promise<QuoteRequestWithDetails | null> {
  const quote = await db
    .select()
    .from(quoteRequestsTable)
    .where(eq(quoteRequestsTable.id, id))
    .limit(1);

  if (!quote[0]) return null;

  const user = await getUtilizadorById(quote[0].userId);
  if (!user) return null;

  const items = await db
    .select({
      id: quoteItemsTable.id,
      quoteId: quoteItemsTable.quoteId,
      materialId: quoteItemsTable.materialId,
      quantity: quoteItemsTable.quantity,
      material: materialsTable,
    })
    .from(quoteItemsTable)
    .leftJoin(materialsTable, eq(quoteItemsTable.materialId, materialsTable.id))
    .where(eq(quoteItemsTable.quoteId, id));

  return {
    ...quote[0],
    user,
    items: items as QuoteItemWithMaterial[],
  };
}

export async function getAllQuoteRequests(
  limit = 50,
  offset = 0,
): Promise<QuoteRequest[]> {
  return await db
    .select()
    .from(quoteRequestsTable)
    .orderBy(desc(quoteRequestsTable.date))
    .limit(limit)
    .offset(offset);
}

// ============================================
// ORDER QUERIES
// ============================================

export async function getUserOrders(
  userId: number,
  limit = 50,
  offset = 0,
): Promise<Order[]> {
  const orders = await db
    .select({
      id: ordersTable.id,
      quoteId: ordersTable.quoteId,
      status: ordersTable.status,
      confirmationDate: ordersTable.confirmationDate,
    })
    .from(ordersTable)
    .leftJoin(quoteRequestsTable, eq(ordersTable.quoteId, quoteRequestsTable.id))
    .where(eq(quoteRequestsTable.userId, userId))
    .orderBy(desc(ordersTable.confirmationDate))
    .limit(limit)
    .offset(offset);

  return orders;
}

export async function getOrderById(id: number): Promise<OrderWithQuote | null> {
  const order = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);

  if (!order[0]) return null;

  const quote = await getQuoteRequestById(order[0].quoteId);
  if (!quote) return null;

  return {
    ...order[0],
    quote,
  };
}

export async function getAllOrders(
  limit = 50,
  offset = 0,
): Promise<Order[]> {
  return await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.confirmationDate))
    .limit(limit)
    .offset(offset);
}

// ============================================
// MEETING QUERIES
// ============================================

export async function getUserMeetings(
  userId: number,
  limit = 50,
  offset = 0,
): Promise<MeetingWithUser[]> {
  const meetings = await db
    .select({
      id: meetingsTable.id,
      userId: meetingsTable.userId,
      date: meetingsTable.date,
      description: meetingsTable.description,
      user: utilizadorTable,
    })
    .from(meetingsTable)
    .leftJoin(utilizadorTable, eq(meetingsTable.userId, utilizadorTable.id))
    .where(eq(meetingsTable.userId, userId))
    .orderBy(desc(meetingsTable.date))
    .limit(limit)
    .offset(offset);

  return meetings as MeetingWithUser[];
}

export async function getEmployeeMeetings(
  limit = 50,
  offset = 0,
): Promise<MeetingWithUser[]> {
  const meetings = await db
    .select({
      id: meetingsTable.id,
      userId: meetingsTable.userId,
      date: meetingsTable.date,
      description: meetingsTable.description,
      user: utilizadorTable,
    })
    .from(meetingsTable)
    .leftJoin(utilizadorTable, eq(meetingsTable.userId, utilizadorTable.id))
    .orderBy(desc(meetingsTable.date))
    .limit(limit)
    .offset(offset);

  return meetings as MeetingWithUser[];
}

export async function getMeetingById(id: number): Promise<MeetingWithUser | null> {
  const result = await db
    .select({
      id: meetingsTable.id,
      userId: meetingsTable.userId,
      date: meetingsTable.date,
      description: meetingsTable.description,
      user: utilizadorTable,
    })
    .from(meetingsTable)
    .leftJoin(utilizadorTable, eq(meetingsTable.userId, utilizadorTable.id))
    .where(eq(meetingsTable.id, id))
    .limit(1);

  return (result[0] as MeetingWithUser) ?? null;
}

// ============================================
// CATEGORY QUERIES
// ============================================

export async function getAllCategories() {
  return await db.select().from(categoriesTable).orderBy(asc(categoriesTable.name));
}

export async function getMainCategories() {
  return await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.parentCategoryId, null))
    .orderBy(asc(categoriesTable.name));
}

export async function getSubcategories(parentId: number) {
  return await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.parentCategoryId, parentId))
    .orderBy(asc(categoriesTable.name));
}

export async function getCategoryById(id: number) {
  const result = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, id))
    .limit(1);

  return result[0] ?? null;
}
