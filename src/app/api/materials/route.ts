import { NextRequest, NextResponse } from "next/server";
import {
  countMaterials,
  getMaterialsWithVariants,
  setMaterialImages,
  type MaterialFilterOptions,
  type MaterialImageInput,
  type MaterialSortBy,
  type SortOrder,
} from "@/lib/queries/materials-mysql";
import { db } from "~/db";
import { materialsTable } from "~/db/schema";

const SORT_FIELDS: readonly MaterialSortBy[] = ["name", "price", "stock", "updatedAt"];

/**
 * GET /api/materials
 * Listar materiais com detalhes (categorias, tipos de preço e variações).
 * Query params:
 *   Filtros:   categoryId, search, minPrice, maxPrice, featured=true, inStock=true
 *   Ordenação: sortBy=name|price|stock|updatedAt, sortOrder=asc|desc
 *   Paginação: page (1-based) OU offset, limit (1-100)
 *   Extra:     variants=false (salta as variações — mais rápido para listagens)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Aceita `categoryId` único ou vários (separados por vírgula, ex: categoryId=1,2,3).
    const categoryIdRaw = searchParams.get("categoryId");
    const categoryIds = categoryIdRaw
      ? categoryIdRaw
          .split(",")
          .map((v) => parseInt(v.trim(), 10))
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];
    const categoryId = categoryIds.length === 1 ? categoryIds[0] : undefined;
    const search = searchParams.get("search") || undefined;
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const featuredOnly = searchParams.get("featured") === "true";
    const inStockOnly = searchParams.get("inStock") === "true";

    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 50;
    // Aceita `page` (1-based) ou `offset` direto.
    const pageParam = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : undefined;
    const offset = pageParam && pageParam > 0
      ? (pageParam - 1) * limit
      : searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!, 10)
        : 0;

    const sortByParam = searchParams.get("sortBy") as MaterialSortBy | null;
    const sortBy: MaterialSortBy =
      sortByParam && SORT_FIELDS.includes(sortByParam) ? sortByParam : "name";
    const sortOrder: SortOrder =
      searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

    const includeVariants = searchParams.get("variants") !== "false";

    // Validar limites
    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: "Limite deve estar entre 1 e 100" },
        { status: 400 },
      );
    }

    const filters: MaterialFilterOptions = {
      categoryId,
      categoryIds: categoryIds.length > 1 ? categoryIds : undefined,
      search,
      minPrice,
      maxPrice,
      featuredOnly,
      inStockOnly,
    };

    // Total (para paginação) + página atual em paralelo.
    const [total, materials] = await Promise.all([
      countMaterials(filters),
      getMaterialsWithVariants({
        ...filters,
        limit,
        offset,
        sortBy,
        sortOrder,
        includeVariants,
      }),
    ]);

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
          total,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.max(1, Math.ceil(total / limit)),
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
    const { name, description, price, stock, categoryId, image, isFeatured, attributes, images } = body;

    // Validar campos obrigatórios
    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Nome e categoria são obrigatórios" },
        { status: 400 },
      );
    }

    // Imagem principal = por-defeito da lista (se vier lista), senão o campo `image`.
    const imgList = (Array.isArray(images) ? images : []) as MaterialImageInput[];
    const hasImages = imgList.length > 0;
    const mainImage = hasImages
      ? (imgList.find((i) => i.isDefault)?.url?.trim()
          || imgList[0]?.url?.trim()
          || "")
      : (image || "");

    // Inserir material
    const result = await db.insert(materialsTable).values({
      name,
      description: description || "",
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      categoryId: parseInt(categoryId),
      image: mainImage,
      isFeatured: Boolean(isFeatured),
      attributes: attributes || {},
    });

    // Gravar imagens na tabela dedicada.
    if (hasImages) {
      await setMaterialImages(
        Number((result as unknown as { insertId: number }).insertId),
        imgList,
      );
    }

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
