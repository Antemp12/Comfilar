import { NextRequest, NextResponse } from "next/server";
import {
  addOrderItem,
  removeOrderItem,
  getOrderWithItems,
  updateOrderItemQuantity,
  clearOrderItems,
} from "@/lib/queries/shopping-cart-mysql";
import {
  getMaterialWithVariants,
  getVariantById,
} from "@/lib/queries/materials-mysql";

/**
 * POST /api/cart/items
 * Adicionar item ao carrinho de compras
 * Body: { cartId, materialId, variantId?, quantity }
 * Valida disponibilidade antes de adicionar
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cartId?: number; materialId?: number; variantId?: number; quantity?: number };
    const { cartId, materialId, variantId, quantity } = body;

    // Validações
    if (!cartId || !materialId || !quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "cartId, materialId e quantity são obrigatórios",
        },
        { status: 400 },
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantidade deve ser >= 1" },
        { status: 400 },
      );
    }

    // Buscar material
    const material = await getMaterialWithVariants(materialId);
    if (!material) {
      return NextResponse.json(
        { success: false, message: "Material não encontrado" },
        { status: 404 },
      );
    }

    // Se tem variante, buscar e validar
    let priceAdjustment = 0;
    if (variantId) {
      const variant = await getVariantById(variantId);
      if (!variant) {
        return NextResponse.json(
          { success: false, message: "Variante não encontrada" },
          { status: 404 },
        );
      }

      if (!variant.isAvailable) {
        return NextResponse.json(
          { success: false, message: "Variante não está disponível" },
          { status: 409 },
        );
      }

      // Validar stock da variante
      if (variant.stock !== null && variant.stock < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Stock insuficiente. Disponível: ${variant.stock}`,
          },
          { status: 409 },
        );
      }

      priceAdjustment = parseFloat(variant.priceAdjustment as any);
    }

    // Validar stock do material
    if (material.stock !== null && material.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Stock insuficiente. Disponível: ${material.stock}`,
        },
        { status: 409 },
      );
    }

    const unitPrice =
      parseFloat(material.price as any) + priceAdjustment;

    const newItem = await addOrderItem({
      orderId: cartId,
      materialId,
      variantId,
      quantity,
      unitPrice,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Item adicionado ao carrinho",
        data: {
          id: newItem.id,
          quantity: newItem.quantity,
          unitPrice: parseFloat(newItem.unitPrice as any),
          subtotal: parseFloat(newItem.subtotal as any),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao adicionar item ao carrinho:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao adicionar item ao carrinho" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/cart/items/[itemId]
 * Atualizar quantidade de um item
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as { itemId?: number; quantity?: number };
    const { itemId, quantity } = body;

    if (!itemId || !quantity) {
      return NextResponse.json(
        { success: false, message: "itemId e quantity são obrigatórios" },
        { status: 400 },
      );
    }

    const updated = await updateOrderItemQuantity(itemId, quantity);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Item não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Item atualizado com sucesso",
        data: updated,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar item" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/cart/items/[itemId]
 * Remover item do carrinho
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "itemId é obrigatório" },
        { status: 400 },
      );
    }

    const removed = await removeOrderItem(parseInt(itemId, 10));

    if (!removed) {
      return NextResponse.json(
        { success: false, message: "Item não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Item removido do carrinho" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao remover item:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao remover item" },
      { status: 500 },
    );
  }
}
