import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { meetingRequestsTable, utilizadorTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromHeader, validateToken } from "~/lib/auth-comfilar";
import { createNotification } from "~/lib/notifications-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/meetings/[id]
 * Atualizar status de pedido de reunião (aprovar/rejeitar)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader) || req.cookies.get("auth_token")?.value || null;
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 });
    }
    
    const payload = validateToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 });
    }

    // Buscar usuário para verificar o cargo
    const user = await db
      .select()
      .from(utilizadorTable)
      .where(eq(utilizadorTable.id, payload.userId))
      .limit(1);

    if (!user[0] || (user[0].type !== "admin" && user[0].type !== "funcionario")) {
      return NextResponse.json({ success: false, message: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, reason } = body as { 
      status?: "pendente" | "aprovado" | "rejeitado" | "cancelado";
      reason?: string;
    };

    if (!status || !["pendente", "aprovado", "rejeitado", "cancelado"].includes(status)) {
      return NextResponse.json({ success: false, message: "Status inválido" }, { status: 400 });
    }

    // Buscar informações da reunião antes de atualizar
    const [meeting] = await db
      .select()
      .from(meetingRequestsTable)
      .where(eq(meetingRequestsTable.id, parseInt(id)))
      .limit(1);

    if (!meeting) {
      return NextResponse.json({ success: false, message: "Reunião não encontrada" }, { status: 404 });
    }

    // Se o status for cancelado ou rejeitado, eliminar fisicamente
    if (status === "cancelado" || status === "rejeitado") {
      // Enviar notificação antes de eliminar
      try {
        const reasonText = reason ? `\n\nMotivo: ${reason}` : "";
        const title = status === "cancelado" ? "Reunião Cancelada" : "Reunião Rejeitada";
        const actionText = status === "cancelado" ? "cancelada" : "rejeitada";
        
        await createNotification({
          userId: meeting.userId,
          type: "reuniao_cancelada", // Usar tipo vermelho para cancelamento/rejeição
          title,
          message: `A sua reunião para ${new Date(meeting.date).toLocaleDateString("pt-PT", { timeZone: "UTC" })} às ${meeting.startTime} foi ${actionText}.${reasonText}\n\nPara mais informações, contacte-nos via WhatsApp: +351 xxx xxx xxx`,
        });
      } catch (error) {
        console.error("Erro ao enviar notificação:", error);
      }

      // Eliminar fisicamente
      await db
        .delete(meetingRequestsTable)
        .where(eq(meetingRequestsTable.id, parseInt(id)));

      return NextResponse.json({ 
        success: true, 
        message: status === "cancelado" ? "Reunião cancelada e eliminada" : "Reunião rejeitada e eliminada" 
      }, { status: 200 });
    }

    // Para status aprovado, apenas atualizar
    await db
      .update(meetingRequestsTable)
      .set({ status })
      .where(eq(meetingRequestsTable.id, parseInt(id)));

    // Enviar notificação
    if (status === "aprovado") {
      try {
        await createNotification({
          userId: meeting.userId,
          type: "reuniao_agendada",
          title: "Reunião Aprovada",
          message: `A sua reunião para ${new Date(meeting.date).toLocaleDateString("pt-PT", { timeZone: "UTC" })} às ${meeting.startTime} foi aprovada.`,
        });
      } catch (error) {
        console.error("Erro ao enviar notificação:", error);
      }
    }

    return NextResponse.json({ success: true, message: "Status atualizado" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/admin/meetings/[id] error", err);
    return NextResponse.json({ success: false, message: "Erro ao atualizar pedido" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/meetings/[id]
 * Eliminar pedido de reunião (apaga fisicamente)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader) || req.cookies.get("auth_token")?.value || null;
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 });
    }
    
    const payload = validateToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 });
    }

    // Buscar usuário para verificar o cargo
    const user = await db
      .select()
      .from(utilizadorTable)
      .where(eq(utilizadorTable.id, payload.userId))
      .limit(1);

    if (!user[0] || (user[0].type !== "admin" && user[0].type !== "funcionario")) {
      return NextResponse.json({ success: false, message: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason } = body as { reason?: string };

    // Buscar informações da reunião antes de eliminar
    const [meeting] = await db
      .select()
      .from(meetingRequestsTable)
      .where(eq(meetingRequestsTable.id, parseInt(id)))
      .limit(1);

    if (!meeting) {
      return NextResponse.json({ success: false, message: "Reunião não encontrada" }, { status: 404 });
    }

    // Enviar notificação antes de eliminar
    try {
      const reasonText = reason ? `\n\nMotivo: ${reason}` : "";
      await createNotification({
        userId: meeting.userId,
        type: "reuniao_cancelada",
        title: "Reunião Cancelada",
        message: `A sua reunião para ${new Date(meeting.date).toLocaleDateString("pt-PT")} às ${meeting.startTime} foi cancelada.${reasonText}\n\nPara mais informações, contacte-nos via WhatsApp: +351 xxx xxx xxx`,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    }

    // Eliminar fisicamente a reunião
    await db
      .delete(meetingRequestsTable)
      .where(eq(meetingRequestsTable.id, parseInt(id)));

    return NextResponse.json({ success: true, message: "Reunião eliminada" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/admin/meetings/[id] error", err);
    return NextResponse.json({ success: false, message: "Erro ao eliminar pedido" }, { status: 500 });
  }
}
