import { NextRequest, NextResponse } from "next/server";
import { validateAdminToken } from "~/lib/auth-api";
import {
  getCategoryAttributes,
  setCategoryAttributes,
  type CategoryAttributeInput,
} from "~/lib/queries/category-attributes-mysql";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function toValues(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * GET /api/admin/categories/:id/attributes
 * Filtros PRÓPRIOS da categoria (sem herança) — para o editor do admin.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await validateAdminToken(request);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = parseInt(id, 10);
  if (!categoryId || Number.isNaN(categoryId)) {
    return NextResponse.json({ error: "ID de categoria inválido" }, { status: 400 });
  }

  const attrs = await getCategoryAttributes(categoryId);
  return NextResponse.json({
    data: attrs.map((a: (typeof attrs)[0]) => ({
      id: a.id,
      name: a.attributeName,
      values: toValues(a.attributeValues),
      type: (a as { type?: string }).type ?? "select",
    })),
  });
}

/**
 * PUT /api/admin/categories/:id/attributes
 * Substitui todos os filtros próprios da categoria.
 * Body: { attributes: [{ name: string, values: string[] }] }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await validateAdminToken(request);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = parseInt(id, 10);
  if (!categoryId || Number.isNaN(categoryId)) {
    return NextResponse.json({ error: "ID de categoria inválido" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { attributes?: unknown };
    if (!Array.isArray(body.attributes)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const attrs: CategoryAttributeInput[] = body.attributes.map((a: any) => ({
      name: typeof a?.name === "string" ? a.name : "",
      type: a?.type === "number" ? "number" : "select",
      values: Array.isArray(a?.values)
        ? a.values.filter((v: unknown): v is string => typeof v === "string")
        : [],
    }));

    // Nomes de atributo duplicados (case-insensitive) não são permitidos.
    const names = attrs
      .map((a) => a.name.trim().toLowerCase())
      .filter(Boolean);
    if (new Set(names).size !== names.length) {
      return NextResponse.json(
        { error: "Há filtros com o mesmo nome" },
        { status: 400 },
      );
    }

    await setCategoryAttributes(categoryId, attrs);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao guardar filtros da categoria:", error);
    return NextResponse.json(
      { error: "Erro ao guardar filtros" },
      { status: 500 },
    );
  }
}
