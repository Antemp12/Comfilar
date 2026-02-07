import { NextRequest, NextResponse } from "next/server";
import {
  addFavorite,
  getFavoritesForUser,
  removeFavorite,
} from "~/lib/queries/favorites-db";
import { validateTokenFormat } from "~/lib/auth-middleware";
import { getTokenFromHeader, validateToken } from "~/lib/auth-comfilar";

async function getUserIdFromRequest(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("Authorization"));
  if (!token || !validateTokenFormat(token)) {
    return null;
  }

  const payload = validateToken(token);
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    return null;
  }

  return payload.userId as number;
}

/**
 * GET /api/favorites
 * Obter lista de materiais favoritados pelo utilizador
 * Requer autenticacao JWT valida
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await getFavoritesForUser(userId);
    return NextResponse.json({ data: favorites }, { status: 200 });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/favorites
 * Adicionar material aos favoritos do utilizador
 * Body: { materialId: number }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { materialId?: unknown };
    const { materialId } = body;

    if (!materialId || typeof materialId !== "number") {
      return NextResponse.json(
        { error: "Invalid materialId" },
        { status: 400 },
      );
    }

    await addFavorite(userId, materialId);
    const favorites = await getFavoritesForUser(userId);
    return NextResponse.json({ data: favorites }, { status: 200 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { materialId?: unknown };
    const { materialId } = body;

    if (!materialId || typeof materialId !== "number") {
      return NextResponse.json(
        { error: "Invalid materialId" },
        { status: 400 },
      );
    }

    await removeFavorite(userId, materialId);
    const favorites = await getFavoritesForUser(userId);
    return NextResponse.json({ data: favorites }, { status: 200 });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}
