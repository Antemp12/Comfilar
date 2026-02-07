import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/auth-comfilar";
import { getTokenFromHeader, validateToken } from "@/lib/auth-comfilar";
import { getAllUsers, deleteUser, updateUserType } from "@/lib/auth-comfilar";
import { createUserSchema } from "@/lib/validations/auth";
import { createUser } from "@/lib/auth-comfilar";

/**
 * GET /api/admin/users
 * Listar todos os utilizadores do sistema (admin only)
 * Retorna lista completa com nomes, emails, e tipos de utilizador
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
        { success: false, message: "Não autenticado" },
        { status: 401 },
      );
    }

    const decoded = validateToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token inválido" },
        { status: 401 },
      );
    }

    const user = await getUserById(decoded.userId);
    if (!user || user.type !== "admin") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    // Listar utilizadores
    const users = await getAllUsers();

    return NextResponse.json(
      {
        success: true,
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          type: u.type,
          registrationDate: u.registrationDate,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao listar utilizadores:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao listar utilizadores" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/users
 * Criar novo utilizador (admin only)
 */
export async function POST(request: NextRequest) {
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
        { success: false, message: "Não autenticado" },
        { status: 401 },
      );
    }

    const decoded = validateToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token inválido" },
        { status: 401 },
      );
    }

    const user = await getUserById(decoded.userId);
    if (!user || user.type !== "admin") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    // Validar dados
    const body = await request.json();
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Criar utilizador
    const newUser = await createUser(validation.data);
    if (!newUser) {
      return NextResponse.json(
        { success: false, message: "Erro ao criar utilizador" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Utilizador criado com sucesso",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          type: newUser.type,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar utilizador:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao criar utilizador" },
      { status: 500 },
    );
  }
}
