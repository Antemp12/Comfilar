import { NextRequest, NextResponse } from "next/server";
import { getVariantById } from "@/lib/queries/materials-mysql";

interface RouteParams {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
}

/**
 * GET /api/materials/[id]/variants/[variantId]
 * Obter uma variação específica
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, variantId } = await params;

    if (!variantId) {
      return NextResponse.json(
        { success: false, message: "ID da variação é obrigatório" },
        { status: 400 },
      );
    }

    const variant = await getVariantById(parseInt(variantId, 10));

    if (!variant) {
      return NextResponse.json(
        { success: false, message: "Variação não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: variant.id,
          materialId: variant.materialId,
          name: variant.name,
          value: variant.value,
          label: variant.label,
          image: variant.image,
          stock: variant.stock,
          priceAdjustment: parseFloat(variant.priceAdjustment as any),
          isAvailable: variant.isAvailable,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar variação:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar variação" },
      { status: 500 },
    );
  }
}
