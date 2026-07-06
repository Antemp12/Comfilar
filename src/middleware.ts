import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeader, verifySessionTokenEdge } from "~/lib/auth-middleware";

// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================

export async function middleware(request: NextRequest) {
  // Rotas que requerem autenticação
  const protectedRoutes = [
    "/api/quotes",
    "/api/orders",
    "/api/meetings",
    // /api/materials GET deve ser público para navegação de produtos
    "/api/materials",
    "/api/admin",
    "/dashboard",
    "/funcionario",
    "/admin",
    "/perfil",
  ];

  // Rotas públicas
  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/logout",
    "/api/auth/me",
    "/",
    "/login",
    "/register",
  ];

  const pathname = request.nextUrl.pathname;

  // Verificar se é rota protegida
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // Permitir GET público para /api/materials (listagem/detalhe de produtos)
  if (isProtected && pathname.startsWith("/api/materials") && request.method === "GET") {
    return NextResponse.next();
  }
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // Se for rota protegida, validar a assinatura do token (header ou cookie).
  if (isProtected) {
    const token =
      getTokenFromHeader(request.headers.get("authorization")) ||
      request.cookies.get("auth_token")?.value ||
      null;

    if (!token || !(await verifySessionTokenEdge(token))) {
      return NextResponse.json(
        { success: false, message: "Não autenticado" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
