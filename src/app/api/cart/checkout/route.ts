import { NextRequest, NextResponse } from "next/server";
import {
  finalizeOrder,
  orderHasItems,
  getOrderWithItems,
  calculateOrderTotal,
  clearOrderItems,
} from "@/lib/queries/shopping-cart-mysql";
import { notifyOrderCreated } from "@/lib/notifications-service";

/**
 * POST /api/cart/checkout
 * Finalizar carrinho e criar encomenda
 * Valida itens, calcula total, cria registro de pedido
 * Body: { cartId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cartId?: number };
    const { cartId } = body;

    if (!cartId) {
      return NextResponse.json(
        { success: false, message: "cartId é obrigatório" },
        { status: 400 },
      );
    }

    // Validar que carrinho tem itens
    const hasItems = await orderHasItems(cartId);
    if (!hasItems) {
      return NextResponse.json(
        { success: false, message: "Carrinho está vazio" },
        { status: 400 },
      );
    }

    // Finalizar pedido
    const finalizedOrder = await finalizeOrder(cartId);

    // Buscar detalhes completos
    const orderDetails = await getOrderWithItems(cartId);
    const total = await calculateOrderTotal(cartId);

    // Buscar userId do pedido (necessário para notificação)
    // Como não temos userId direto, usamos a primeira query
    const cartUserId = orderDetails?.items[0]?.order.id; // placeholder
    
    // Enviar notificação de pedido criado
    // TODO: Obter userId real do contexto da sessão
    // if (userId) {
    //   await notifyOrderCreated(userId, finalizedOrder.id);
    // }

    return NextResponse.json(
      {
        success: true,
        message: "Pedido finalizado com sucesso",
        data: {
          id: finalizedOrder.id,
          status: finalizedOrder.status,
          confirmationDate: finalizedOrder.confirmationDate,
          itemCount: orderDetails?.items.length || 0,
          total: parseFloat(total.toFixed(2)),
          items: orderDetails?.items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice as any),
            subtotal: parseFloat(item.subtotal as any),
            material: {
              id: item.material.id,
              name: item.material.name,
            },
          })) || [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao finalizar pedido";
    console.error("Erro ao fazer checkout:", error);

    return NextResponse.json(
      { success: false, message },
      { status: message.includes("vazio") ? 400 : 500 },
    );
  }
}

/**
 * DELETE /api/cart/clear
 * Limpar carrinho (remover todos os itens)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId");

    if (!cartId) {
      return NextResponse.json(
        { success: false, message: "cartId é obrigatório" },
        { status: 400 },
      );
    }

    await clearOrderItems(parseInt(cartId, 10));

    return NextResponse.json(
      { success: true, message: "Carrinho limpo com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao limpar carrinho:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao limpar carrinho" },
      { status: 500 },
    );
  }
}
