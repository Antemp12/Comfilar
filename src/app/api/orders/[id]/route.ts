import { NextRequest, NextResponse } from "next/server";
import {
  getOrderWithItems,
  updateOrderStatus,
  calculateOrderTotal,
} from "@/lib/queries/shopping-cart-mysql";
import {
  notifyOrderInPreparation,
  notifyOrderShipped,
  notifyOrderDelivered,
} from "@/lib/notifications-service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

type OrderItem = {
  id: number;
  orderId: number;
  materialId: number;
  variantId: number | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  material: {
    id: number;
    name: string;
    image: string | null;
    category: {
      id: number;
      name: string;
    };
  };
  variant: {
    id: number;
    name: string;
    value: string;
    label: string;
    priceAdjustment: string;
  } | null;
};

/**
 * GET /api/orders/[id]
 * Obter detalhe de um pedido com itens
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID do pedido é obrigatório" },
        { status: 400 },
      );
    }

    const order = await getOrderWithItems(parseInt(id, 10));

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    // Calcular total
    const total = await calculateOrderTotal(parseInt(id, 10));

    return NextResponse.json(
      {
        success: true,
        data: {
          id: order.id,
          status: order.status,
          confirmationDate: order.confirmationDate,
          total: parseFloat(total.toFixed(2)),
          items: order.items.map((item: OrderItem) => ({
            id: item.id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice as any),
            subtotal: parseFloat(item.subtotal as any),
            material: {
              id: item.material.id,
              name: item.material.name,
              image: item.material.image,
              category: {
                id: item.material.category.id,
                name: item.material.category.name,
              },
            },
            variant: item.variant
              ? {
                  id: item.variant.id,
                  name: item.variant.name,
                  value: item.variant.value,
                  label: item.variant.label,
                  priceAdjustment: parseFloat(
                    item.variant.priceAdjustment as any,
                  ),
                }
              : null,
          })),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar pedido" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Atualizar status do pedido
 * Body: { status: "processamento" | "preparacao" | "enviado" | "entregue" }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as { status?: string };
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID do pedido é obrigatório" },
        { status: 400 },
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status é obrigatório" },
        { status: 400 },
      );
    }

    const validStatuses = ["processamento", "preparacao", "enviado", "entregue"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status inválido. Deve ser um de: " + validStatuses.join(", "),
        },
        { status: 400 },
      );
    }

    const updated = await updateOrderStatus(
      parseInt(id, 10),
      status as "processamento" | "preparacao" | "enviado" | "entregue",
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    // Enviar notificação baseada no novo status
    // TODO: Obter userId real do contexto da sessão
    // const userId = ... // from auth context
    // if (status === "preparacao") {
    //   await notifyOrderInPreparation(userId, parseInt(id, 10));
    // } else if (status === "enviado") {
    //   await notifyOrderShipped(userId, parseInt(id, 10));
    // } else if (status === "entregue") {
    //   await notifyOrderDelivered(userId, parseInt(id, 10));
    // }

    return NextResponse.json(
      {
        success: true,
        message: "Status do pedido atualizado com sucesso",
        data: {
          id: updated.id,
          status: updated.status,
          confirmationDate: updated.confirmationDate,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar status do pedido" },
      { status: 500 },
    );
  }
}
