import { NextRequest, NextResponse } from "next/server";
import { getMaterialsWithVariants } from "@/lib/queries/materials-mysql";
import { db } from "~/db";
import { materialsTable } from "~/db/schema";

/**
 * GET /api/materials
 * Listar todos os materiais disponiveis com detalhes
 * Inclui categorias, tipos de preco e variacoes
 * Filtros: categoryId, search, minPrice, maxPrice, limit (50), offset (0)
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
          isFeatured: m.isFeatured || false,
          attributes: typeof m.attributes === 'string' ? JSON.parse(m.attributes || '{}') : (m.attributes || {}),
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

/**
 * POST /api/materials
 * Criar novo material
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as any;
    const { name, description, price, stock, categoryId, image, isFeatured, attributes } = body;

    // Validar campos obrigatórios
    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Nome e categoria são obrigatórios" },
        { status: 400 },
      );
    }

    // Inserir material
    const result = await db.insert(materialsTable).values({
      name,
      description: description || "",
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      categoryId: parseInt(categoryId),
      image: image || "",
      isFeatured: Boolean(isFeatured),
      attributes: attributes || {},
    });

    return NextResponse.json(
      {
        success: true,
        message: "Material criado com sucesso",
        id: result.insertId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar material:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao criar material" },
      { status: 500 },
    );
  }
}
