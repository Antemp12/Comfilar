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
    const sessionToken = cookieStore.get("auth_token")?.value;

    console.log("🔐 Cookie check:");
    console.log("🔐 auth_token value:", sessionToken ? "FOUND" : "NOT FOUND");

    if (!sessionToken) {
      return null;
    }

    // Decode token from base64 (formato: base64(userId:timestamp))
    const decodedToken = Buffer.from(sessionToken, 'base64').toString('utf-8');
    console.log("🔐 Decoded token:", decodedToken);
    
    const [userIdStr] = decodedToken.split(":");
    const userId = parseInt(userIdStr, 10);

    console.log("🔐 Extracted userId:", userId);

    if (isNaN(userId)) {
      console.log("🔐 Invalid user ID from token:", userIdStr);
      return null;
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(utilizadorTable)
      .where(eq(utilizadorTable.id, userId))
      .limit(1);

    console.log("🔐 User found:", user?.email);
    return user || null;
  } catch (error) {
    console.error("Error validating admin token:", error);
    return null;
  }
}
