// src/lib/session-token.ts
// Token de sessão assinado com HMAC-SHA256 (runtime Node).
// Formato: base64url(userId:timestamp).base64url(hmac)
//
// Substitui o antigo token `base64(userId:timestamp)` que era FALSIFICÁVEL
// (qualquer pessoa podia forjar um token de admin). Agora o token só é válido
// se a assinatura HMAC bater com o segredo do servidor.

import crypto from "node:crypto";

const SECRET =
  process.env.AUTH_SECRET ||
  process.env.BETTER_AUTH_SECRET ||
  "dev-secret-key-change-me";

// Validade do token: 30 dias.
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

/**
 * Cria um token de sessão assinado para um utilizador.
 */
export function signSessionToken(userId: number): string {
  const payload = `${userId}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

/**
 * Verifica um token de sessão assinado.
 * Devolve { userId } se a assinatura for válida e não estiver expirado, senão null.
 */
export function verifySessionToken(token: string): { userId: number } | null {
  try {
    if (!token || !token.includes(".")) return null;

    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;

    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("base64url");

    // Comparação em tempo constante (evita timing attacks).
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const [userIdStr, tsStr] = payload.split(":");
    const userId = parseInt(userIdStr, 10);
    const ts = parseInt(tsStr, 10);
    if (Number.isNaN(userId) || Number.isNaN(ts)) return null;

    // Expiração.
    if (Date.now() - ts > MAX_AGE_MS) return null;

    return { userId };
  } catch {
    return null;
  }
}
