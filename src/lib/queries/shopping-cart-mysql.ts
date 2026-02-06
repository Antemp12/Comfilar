import { db } from "@/db";
import {
  ordersTable,
  orderItemsTable,
  utilizadorTable,
  materialsTable,
  materialVariantsTable,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Criar novo pedido vazio para o cliente
 */
export async function createOrder(userId: number) {
  await db
    .insert(ordersTable)
    .values({
      quoteId: 0, // Placeholder para compatibilidade com schema
      status: "processamento",
      confirmationDate: new Date(),
    });

  // Retornar o pedido mais recente
  const order = await db.query.ordersTable.findFirst({
    orderBy: desc(ordersTable.id),
  });
  return order!;
}

/**
 * Adicionar item ao pedido
 */
export async function addOrderItem(data: {
  orderId: number;
  materialId: number;
  variantId?: number;
  quantity: number;
  unitPrice: number;
}) {
  const subtotal = (data.unitPrice * data.quantity).toString();

  const newItem = await db
    .insert(orderItemsTable)
    .values({
      orderId: data.orderId,
      materialId: data.materialId,
      variantId: data.variantId,
      quantity: data.quantity,
      unitPrice: data.unitPrice.toString(),
      subtotal,
    });

  const created = await db.query.orderItemsTable.findFirst({
    where: eq(orderItemsTable.orderId, data.orderId),
    orderBy: desc(orderItemsTable.id),
  });
  return created!;
}

/**
 * Remover item do pedido
 */
export async function removeOrderItem(itemId: number): Promise<boolean> {
  const deleted = await db
    .delete(orderItemsTable)
    .where(eq(orderItemsTable.id, itemId))
    ;

  return true;
}

/**
 * Obter pedido com itens
 */
export async function getOrderWithItems(orderId: number) {
  const order = await db.query.ordersTable.findFirst({
    where: eq(ordersTable.id, orderId),
    with: {
      items: {
        with: {
          material: {
            with: {
              category: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  return order;
}

/**
 * Listar pedidos do usuário
 */
export async function getUserOrders(
  userId: number,
  options: { limit?: number; offset?: number } = {},
) {
  const { limit = 50, offset = 0 } = options;

  return await db
    .selectDistinct()
    .from(ordersTable)
    .innerJoin(orderItemsTable, eq(orderItemsTable.orderId, ordersTable.id))
    .where(eq(ordersTable.confirmationDate, new Date())) // placeholder, será melhorado
    .limit(limit)
    .offset(offset);
}

/**
 * Calcular total do pedido
 */
export async function calculateOrderTotal(orderId: number): Promise<number> {
  const order = await getOrderWithItems(orderId);
  if (!order) return 0;

  let total = 0;
  for (const item of order.items) {
    total += parseFloat(item.subtotal as any);
  }

  return total;
}

/**
 * Atualizar quantidade de um item
 */
export async function updateOrderItemQuantity(
  itemId: number,
  newQuantity: number,
) {
  if (newQuantity < 1) {
    return await removeOrderItem(itemId);
  }

  const item = await db.query.orderItemsTable.findFirst({
    where: eq(orderItemsTable.id, itemId),
  });

  if (!item) return false;

  const newSubtotal = (
    parseFloat(item.unitPrice as any) * newQuantity
  ).toString();

  const updated = await db
    .update(orderItemsTable)
    .set({
      quantity: newQuantity,
      subtotal: newSubtotal,
    })
    .where(eq(orderItemsTable.id, itemId))
    ;

  const refreshed = await db.query.orderItemsTable.findFirst({
    where: eq(orderItemsTable.id, itemId),
  });
  return refreshed || false;
}

/**
 * Limpar pedido (remover todos os itens)
 */
export async function clearOrderItems(orderId: number): Promise<boolean> {
  const deleted = await db
    .delete(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId))
    ;

  return true;
}

/**
 * Finalizar pedido (converter de rascunho para processamento com itens)
 */
export async function finalizeOrder(orderId: number) {
  const order = await getOrderWithItems(orderId);
  if (!order || order.items.length === 0) {
    throw new Error("Pedido vazio ou não encontrado");
  }

  // Update order confirmation date to now
  const updated = await db
    .update(ordersTable)
    .set({
      status: "processamento",
      confirmationDate: new Date(),
    })
    .where(eq(ordersTable.id, orderId))
    ;

  const updatedOrder = await getOrderWithItems(orderId);
  return updatedOrder!;
}

/**
 * Listar todos os pedidos (admin)
 */
export async function getAllOrders(options: {
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { status, limit = 50, offset = 0 } = options;

  let query = db.query.ordersTable.findMany({
    with: {
      items: {
        with: {
          material: {
            with: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: desc(ordersTable.confirmationDate),
    limit,
    offset,
  });

  if (status) {
    const allOrders = await query;
    return allOrders.filter((o: { status: string }) => o.status === status);
  }

  return query;
}

/**
 * Atualizar status do pedido
 */
export async function updateOrderStatus(
  orderId: number,
  newStatus: "processamento" | "preparacao" | "enviado" | "entregue",
) {
  const updated = await db
    .update(ordersTable)
    .set({ status: newStatus })
    .where(eq(ordersTable.id, orderId))
    ;

  const order = await db.query.ordersTable.findFirst({
    where: eq(ordersTable.id, orderId),
  });
  return order || null;
}

/**
 * Verificar se pedido tem itens
 */
export async function orderHasItems(orderId: number): Promise<boolean> {
  const items = await db.query.orderItemsTable.findMany({
    where: eq(orderItemsTable.orderId, orderId),
  });

  return items.length > 0;
}
