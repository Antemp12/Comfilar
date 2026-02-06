import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Logout do utilizador (remove cookies)
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout com sucesso",
      },
      { status: 200 },
    );

    // Remover cookies do custom auth
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });

    // Remover cookies do better-auth
    const betterAuthCookies = [
      "auth.session",
      "auth.session_token",
      "__Secure-auth.session",
      "__Secure-auth.session_token",
    ];

    for (const cookieName of betterAuthCookies) {
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        secure: cookieName.startsWith("__Secure"),
      });
    }

    return response;
  } catch (error) {
    console.error("❌ Logout Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro no logout",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
