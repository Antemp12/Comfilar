import { NextRequest, NextResponse } from "next/server";
import { getVariantsByMaterialId } from "@/lib/queries/materials-mysql";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/materials/[id]/variants
 * Listar variações de um material
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID do material é obrigatório" },
        { status: 400 },
      );
    }

    const variants = await getVariantsByMaterialId(parseInt(id, 10));

    return NextResponse.json(
      {
        success: true,
        data: variants.map((v) => ({
          id: v.id,
          materialId: v.materialId,
          name: v.name,
          value: v.value,
          label: v.label,
          image: v.image,
          stock: v.stock,
          priceAdjustment: parseFloat(v.priceAdjustment as any),
          isAvailable: v.isAvailable,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar variações:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar variações" },
      { status: 500 },
    );
  }
}
