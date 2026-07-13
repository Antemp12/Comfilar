import { getAllCatalogs } from "@/lib/queries/catalogs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { catalogsTable } from "~/db/schema/catalogs";
import { eq } from "drizzle-orm";
import { validateAdminToken } from "~/lib/auth-api";

/**
 * GET /api/catalogs
 * Listar todos os catalogos disponiveis
 * Cada catalogo tem imagem, titulo e descricao
 */
export async function GET(request: NextRequest) {
  try {
    const catalogs = await getAllCatalogs();
    return NextResponse.json({
      success: true,
      data: catalogs,
    });
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch catalogs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/catalogs
 * Criar novo catalogo (apenas admin)
 * Body: { title, imageUrl, description?, order? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await validateAdminToken(request);
    if (!user || user.type !== "admin") {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json() as {
      title: string;
      imageUrl: string;
      description?: string;
      order?: number;
      type?: string;
      pages?: string[];
      pdfUrl?: string;
    };

    const { title, imageUrl, description, order, type, pages, pdfUrl } = body;


    if (!title || !imageUrl) {
      return NextResponse.json(
        { success: false, message: "Título e URL da imagem são obrigatórios" },
        { status: 400 }
      );
    }

    const cleanPages = Array.isArray(pages)
      ? pages.map((p) => String(p).trim()).filter(Boolean)
      : [];

    const id = `catalog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db
      .insert(catalogsTable)
      .values({
        id,
        title,
        imageUrl,
        description,
        order: order || 0,
        type: type === "pricelist" ? "pricelist" : "carousel",
        pages: cleanPages,
        pdfUrl: typeof pdfUrl === "string" && pdfUrl.trim() ? pdfUrl.trim() : null,
      });

    // Buscar o catálogo criado
    const [newCatalog] = await db
      .select()
      .from(catalogsTable)
      .where(eq(catalogsTable.id, id));


    return NextResponse.json({
      success: true,
      data: newCatalog,
      message: "Catálogo criado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao criar catálogo:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao criar catálogo" },
      { status: 500 }
    );
  }
}
