import { NextRequest, NextResponse } from "next/server";
import {
  getMaterialImages,
  getMaterialWithVariants,
  setMaterialImages,
  type MaterialImageInput,
} from "@/lib/queries/materials-mysql";
import { db } from "~/db";
import { materialsTable, materialVariantsTable } from "~/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/materials/[id]
 * Obter material especifico com variacoes e preco
 * Inclui detalhes completos: categoria, tipo de preco, e variantes
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

    const images = await getMaterialImages(material.id);

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
          images: images.map((img: { id: number; url: string; ordem: number; isDefault: boolean }) => ({
            id: img.id,
            url: img.url,
            ordem: img.ordem,
            isDefault: img.isDefault,
          })),
          categoryId: material.categoryId,
          isFeatured: material.isFeatured,
          attributes: typeof material.attributes === 'string' ? JSON.parse(material.attributes || '{}') : (material.attributes || {}),
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

/**
 * PUT /api/materials/[id]
 * Atualizar dados de um material (admin apenas)
 * Pode editar: nome, descricao, preco, stock, categoria, imagem
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const materialId = parseInt(id, 10);

    if (!materialId || isNaN(materialId)) {
      return NextResponse.json(
        { success: false, message: "ID de material inválido" },
        { status: 400 },
      );
    }

    const body = await request.json() as any;
    const { name, description, price, stock, categoryId, image, isFeatured, attributes, images } = body;

    // Validar campos obrigatórios
    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Nome e categoria são obrigatórios" },
        { status: 400 },
      );
    }

    // Se vier lista de imagens, substitui e usa a por-defeito como imagem principal.
    let mainImage: string = image || "";
    if (Array.isArray(images)) {
      mainImage = await setMaterialImages(materialId, images as MaterialImageInput[]);
    }

    // Atualizar material
    await db
      .update(materialsTable)
      .set({
        name,
        description: description || "",
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        categoryId: parseInt(categoryId),
        image: mainImage,
        isFeatured: Boolean(isFeatured),
        attributes: attributes || {},
      })
      .where(eq(materialsTable.id, materialId));

    return NextResponse.json(
      {
        success: true,
        message: "Material atualizado com sucesso",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar material" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/materials/[id]
 * Soft delete por padrão - marcar como deletado sem remover do BD
 * Query param: force=true para hard delete (realmente remove)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const materialId = parseInt(id, 10);
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';

    if (!materialId || isNaN(materialId)) {
      return NextResponse.json(
        { success: false, message: "ID de material inválido" },
        { status: 400 },
      );
    }

    if (forceDelete) {
      // Hard delete: remover realmente da BD (cuidado com foreign keys!)
      // Primeiro remove as variantes associadas
      await db.delete(materialVariantsTable).where(eq(materialVariantsTable.materialId, materialId));
      
      // Depois remove o material
      await db.delete(materialsTable).where(eq(materialsTable.id, materialId));

      return NextResponse.json(
        {
          success: true,
          message: "Material eliminado permanentemente",
        },
        { status: 200 },
      );
    } else {
      // Soft delete: apenas marcar como deletado
      await db
        .update(materialsTable)
        .set({
          isDeleted: true,
        })
        .where(eq(materialsTable.id, materialId));

      return NextResponse.json(
        {
          success: true,
          message: "Material deletado com sucesso",
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Erro ao deletar material:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao deletar material" },
      { status: 500 },
    );
  }
}
