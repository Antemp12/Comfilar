import { NextRequest, NextResponse } from "next/server";
import { getMaterialsWithVariants } from "@/lib/queries/materials-mysql";

/**
 * GET /api/materials
 * Listar materiais com variações
 * Query params:
 * - categoryId: number
 * - search: string
 * - minPrice: number
 * - maxPrice: number
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId")
      ? parseInt(searchParams.get("categoryId")!, 10)
      : undefined;
    const search = searchParams.get("search") || undefined;
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0;

    // Validar limites
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: "Limite deve estar entre 1 e 100" },
        { status: 400 },
      );
    }

    console.log("🔍 Materials API called with:", {
      categoryId,
      search,
      minPrice,
      maxPrice,
      limit,
      offset,
    });

    // Buscar materiais
    const materials = await getMaterialsWithVariants({
      categoryId,
      search,
      minPrice,
      maxPrice,
      limit,
      offset,
    });

    console.log(`✅ Found ${materials.length} materials`);

    return NextResponse.json(
      {
        success: true,
        data: materials.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          price: m.price?.toString() || "0",
          stock: m.stock || 0,
          image: m.image || "/images/placeholder-product.jpg",
          categoryId: m.categoryId,
          priceTypeId: m.priceTypeId,
          category: m.category ? {
            id: m.category.id,
            name: m.category.name,
          } : undefined,
          priceType: m.priceType
            ? {
                id: m.priceType.id,
                type: m.priceType.type,
              }
            : null,
          variants: m.variants?.map((v) => ({
            id: v.id,
            name: v.name,
            value: v.value,
            label: v.label,
            image: v.image,
            stock: v.stock,
            priceAdjustment: v.priceAdjustment?.toString() || "0",
            isAvailable: v.isAvailable,
          })) || [],
        })),
        pagination: {
          limit,
          offset,
          total: materials.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Erro ao listar materiais:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, message: "Erro ao listar materiais", error: errorMessage },
      { status: 500 },
    );
  }
}
