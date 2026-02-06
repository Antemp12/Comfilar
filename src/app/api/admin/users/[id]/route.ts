import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/auth-comfilar";
import { getTokenFromHeader, validateToken } from "@/lib/auth-comfilar";
import { deleteUser, updateUserType } from "@/lib/auth-comfilar";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * DELETE /api/admin/users/[id]
 * Eliminar utilizador (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "ID inválido" },
        { status: 400 },
      );
    }

    // Validar autenticação e permissões
    const token = getTokenFromHeader(request.headers.get("authorization"));
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

    const admin = await getUserById(decoded.userId);
    if (!admin || admin.type !== "admin") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    // Não permitir auto-eliminação
    if (admin.id === userId) {
      return NextResponse.json(
        { success: false, message: "Não podes eliminar-te a ti mesmo" },
        { status: 400 },
      );
    }

    // Eliminar utilizador
    const deleted = await deleteUser(userId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Utilizador não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Utilizador eliminado com sucesso",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao eliminar utilizador:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao eliminar utilizador" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Atualizar tipo de utilizador (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "ID inválido" },
        { status: 400 },
      );
    }

    // Validar autenticação e permissões
    const token = getTokenFromHeader(request.headers.get("authorization"));
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

    const admin = await getUserById(decoded.userId);
    if (!admin || admin.type !== "admin") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    // Validar tipo
    const body = await request.json() as { type?: string };
    const { type } = body;

    if (!type || !["cliente", "funcionario", "admin"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Tipo de utilizador inválido" },
        { status: 400 },
      );
    }

    // Atualizar tipo
    const updated = await updateUserType(
      userId,
      type as "cliente" | "funcionario" | "admin",
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Utilizador não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tipo de utilizador atualizado com sucesso",
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          type: updated.type,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar utilizador:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar utilizador" },
      { status: 500 },
    );
  }
}
