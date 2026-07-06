// src/lib/auth-middleware.ts
// Validação de token para o middleware (Edge Runtime — usa Web Crypto).

const SECRET =
  process.env.AUTH_SECRET ||
  process.env.BETTER_AUTH_SECRET ||
  "dev-secret-key-change-me";

const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias

/**
 * Extrai token do header Authorization (ex: "Bearer token123").
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

function base64urlToString(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  return atob(b64);
}

function bufToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Verifica a assinatura HMAC de um token de sessão (Edge Runtime).
 * Devolve true se a assinatura for válida e o token não estiver expirado.
 */
export async function verifySessionTokenEdge(token: string): Promise<boolean> {
  try {
    if (!token || !token.includes(".")) return false;
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return false;

    const payload = base64urlToString(payloadB64);

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const macBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload),
    );
    if (bufToBase64url(macBuf) !== sig) return false;

    const [, tsStr] = payload.split(":");
    const ts = parseInt(tsStr, 10);
    if (Number.isNaN(ts) || Date.now() - ts > MAX_AGE_MS) return false;

    return true;
  } catch {
    return false;
  }
}
