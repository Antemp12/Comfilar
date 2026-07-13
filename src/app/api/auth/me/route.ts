import { NextRequest, NextResponse } from "next/server";
import {
  getTokenFromHeader,
  validateToken,
  getUserById,
  getUserByEmail,
  hashPassword,
  verifyPassword,
} from "~/lib/auth-comfilar";
import { db } from "~/db";
import { utilizadorTable } from "~/db/schema";
import { eq } from "drizzle-orm";

function tokenFrom(request: NextRequest): string | null {
  const header = getTokenFromHeader(request.headers.get("authorization"));
  return header ?? request.cookies.get("auth_token")?.value ?? null;
}

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

/**
 * PATCH /api/auth/me
 * Atualiza o perfil do próprio utilizador: nome, email e/ou palavra-passe.
 * Body: { name?, email?, currentPassword?, newPassword? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = tokenFrom(request);
    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 });
    }
    const payload = validateToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 });
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Utilizador não encontrado" }, { status: 404 });
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const updates: Partial<{ name: string; email: string; password: string }> = {};

    // Nome
    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length < 2) {
        return NextResponse.json({ success: false, message: "O nome deve ter pelo menos 2 caracteres" }, { status: 400 });
      }
      if (name !== user.name) updates.name = name;
    }

    // Email
    if (typeof body.email === "string") {
      const email = body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, message: "Email inválido" }, { status: 400 });
      }
      if (email !== user.email) {
        const existing = await getUserByEmail(email);
        if (existing && existing.id !== user.id) {
          return NextResponse.json({ success: false, message: "Esse email já está em uso" }, { status: 409 });
        }
        updates.email = email;
      }
    }

    // Palavra-passe
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ success: false, message: "Indica a palavra-passe atual" }, { status: 400 });
      }
      const ok = await verifyPassword(body.currentPassword, user.password);
      if (!ok) {
        return NextResponse.json({ success: false, message: "Palavra-passe atual incorreta" }, { status: 400 });
      }
      if (body.newPassword.length < 6) {
        return NextResponse.json({ success: false, message: "A nova palavra-passe deve ter pelo menos 6 caracteres" }, { status: 400 });
      }
      updates.password = await hashPassword(body.newPassword);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "Nada para atualizar" }, { status: 400 });
    }

    await db.update(utilizadorTable).set(updates).where(eq(utilizadorTable.id, user.id));

    const updated = await getUserById(user.id);
    const { password: _pw, ...userWithoutPassword } = updated!;

    return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar perfil" },
      { status: 500 },
    );
  }
}
