import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeader, validateToken, getUserById } from "~/lib/auth-comfilar";

/**
 * GET /api/auth/me
 * Obter dados do utilizador atualmente autenticado
 * Requer token JWT valido, retorna perfil completo
 */
export async function GET(request: NextRequest) {
  try {
    // Tentar obter token do header Authorization
    const authHeader = request.headers.get("authorization");
    let token = getTokenFromHeader(authHeader);

    // Se não houver no header, tentar do cookie
    if (!token) {
      token = request.cookies.get("auth_token")?.value ?? null;
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token não fornecido",
        },
        { status: 401 },
      );
    }

    // Validar token
    const payload = validateToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Token inválido",
        },
        { status: 401 },
      );
    }

    // Buscar utilizador
    const user = await getUserById(payload.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilizador não encontrado",
        },
        { status: 404 },
      );
    }

    // Retornar dados do utilizador (sem password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Me Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao obter informações do utilizador",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
