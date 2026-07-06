import { NextRequest, NextResponse } from "next/server";
import { getCartForUser, addToCart, updateCartQuantity, removeFromCart, clearCart } from "~/lib/queries/shopping-cart-db";
import { getTokenFromHeader } from "~/lib/auth-comfilar";
import { validateToken } from "~/lib/auth-comfilar";

async function getUserIdFromRequest(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("Authorization"));
  if (!token) {
    return null;
  }

  const payload = validateToken(token);
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    return null;
  }

  return payload.userId as number;
}

/**
 * GET /api/cart
 * Obter carrinho de compras do utilizador autenticado
 * Retorna lista de itens no carrinho com detalhes
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    console.log("GET /api/cart - userId:", userId);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await getCartForUser(userId);
    console.log("GET /api/cart - cart from DB:", cart);
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    console.log("POST /api/cart - userId:", userId);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { materialId?: unknown; quantity?: unknown };
    const { materialId, quantity } = body;
    console.log("POST /api/cart - materialId:", materialId, "quantity:", quantity);

    if (!materialId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid materialId or quantity" },
        { status: 400 }
      );
    }

    console.log("POST /api/cart - calling addToCart...");
    await addToCart(userId, Number(materialId), quantity);
    
    console.log("POST /api/cart - calling getCartForUser...");
    const cart = await getCartForUser(userId);
    console.log("POST /api/cart - cart result:", cart);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Falha ao adicionar ao carrinho" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { materialId?: unknown; quantity?: unknown };
    const { materialId, quantity } = body;

    if (!materialId || quantity === undefined) {
      return NextResponse.json(
        { error: "Invalid materialId or quantity" },
        { status: 400 }
      );
    }

    await updateCartQuantity(userId, Number(materialId), quantity as number);
    const cart = await getCartForUser(userId);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get("materialId");

    if (!materialId) {
      // Clear entire cart
      await clearCart(userId);
    } else {
      // Remove specific item
      await removeFromCart(userId, Number(materialId));
    }

    const cart = await getCartForUser(userId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return NextResponse.json(
      { error: "Failed to delete from cart" },
      { status: 500 }
    );
  }
}

