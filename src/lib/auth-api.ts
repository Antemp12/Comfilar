// src/lib/auth-api.ts
// Token validation for API routes (Node Runtime - can access database)

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/db";
import { utilizadorTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { verifySessionToken } from "~/lib/session-token";

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
    const sessionToken = cookieStore.get("auth_token")?.value;

    if (!sessionToken) {
      return null;
    }

    // Verifica a assinatura HMAC do token (rejeita tokens forjados/expirados).
    const payload = verifySessionToken(sessionToken);
    if (!payload) {
      return null;
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(utilizadorTable)
      .where(eq(utilizadorTable.id, payload.userId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Error validating admin token:", error);
    return null;
  }
}
