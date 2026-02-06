import { NextRequest, NextResponse } from "next/server";
import { getMaterialWithVariants } from "@/lib/queries/materials-mysql";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/materials/[id]
 * Obter material com suas variações
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

    const material = await getMaterialWithVariants(parseInt(id, 10));

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Material não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: material.id,
          name: material.name,
          description: material.description,
          price: parseFloat(material.price as any),
          stock: material.stock,
          image: material.image,
          category: {
            id: material.category.id,
            name: material.category.name,
          },
          priceType: material.priceType
            ? {
                id: material.priceType.id,
                type: material.priceType.type,
              }
            : null,
          variants: material.variants.map((v) => ({
            id: v.id,
            name: v.name,
            value: v.value,
            label: v.label,
            image: v.image,
            stock: v.stock,
            priceAdjustment: parseFloat(v.priceAdjustment as any),
            isAvailable: v.isAvailable,
          })),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar material:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar material" },
      { status: 500 },
    );
  }
}
