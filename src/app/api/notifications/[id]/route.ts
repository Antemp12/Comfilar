import { NextRequest, NextResponse } from "next/server";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/notifications-service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/notifications/[id]
 * Marcar uma notificacao como lida
 * Retorna estado atualizado da notificacao
 */
export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID da notificação é obrigatório" },
        { status: 400 },
      );
    }

    const updated = await markNotificationAsRead(parseInt(id, 10));

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Notificação não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Notificação marcada como lida",
        data: {
          id: updated.id,
          read: updated.read,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao processar notificação" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Deletar notificação
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID da notificação é obrigatório" },
        { status: 400 },
      );
    }

    const deleted = await deleteNotification(parseInt(id, 10));

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Notificação não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Notificação deletada" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao deletar notificação:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao deletar notificação" },
      { status: 500 },
    );
  }
}
