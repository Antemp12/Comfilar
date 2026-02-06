// src/lib/auth-api.ts
// Token validation for API routes (Node Runtime - can access database)

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/db";
import { utilizadorTable } from "~/db/schema";
import { eq } from "drizzle-orm";

/**
 * Valida o token e retorna o utilizador se for admin ou funcionário
 * Apenas para uso em API routes (Node Runtime)
 * @param request - NextRequest
 * @returns Utilizador ou null
 */
export async function validateAdminToken(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session-token")?.value;

    if (!sessionToken) {
      return null;
    }

    // Decode token to get user ID (formato: "userId:timestamp")
    const [userIdStr] = sessionToken.split(":");
    const userId = parseInt(userIdStr, 10);

    if (isNaN(userId)) {
      return null;
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(utilizadorTable)
      .where(eq(utilizadorTable.id, userId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Error validating admin token:", error);
    return null;
  }
}
