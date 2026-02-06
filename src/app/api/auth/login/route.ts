import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "~/lib/auth-comfilar";

/**
 * POST /api/auth/login
 * Login de utilizador
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email e password são obrigatórios",
        },
        { status: 400 },
      );
    }

    // Login
    const result = await loginUser(email, password);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ou password inválidos",
        },
        { status: 401 },
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Login com sucesso",
        user: result.user,
        token: result.token,
      },
      { status: 200 },
    );

    // Grava token em cookie para o middleware reconhecer navegação protegida
    response.cookies.set("auth_token", result.token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("❌ Login Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro no login",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
