// src/lib/auth-middleware.ts
// Token validation for middleware (Edge Runtime compatible)

const TOKEN_SECRET = process.env.AUTH_SECRET || "dev-secret-key";

/**
 * Extrai token do header Authorization
 * @param authHeader - Header Authorization (ex: "Bearer token123")
 * @returns Token ou null
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  
  return null;
}

/**
 * Validação simples de token (sem acesso à BD)
 * Apenas verifica se o token tem formato válido
 * @param token - Token a validar
 * @returns true se o token parece válido
 */
export function validateTokenFormat(token: string): boolean {
  // Aceita o token base64 curto gerado pelo login (ex: "userId:timestamp")
  return Boolean(token && token.length >= 8 && !token.includes(" "));
}
