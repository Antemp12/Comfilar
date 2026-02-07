import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { meetingRequestsTable, utilizadorTable } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { getTokenFromHeader, validateToken } from "~/lib/auth-comfilar";

/**
 * GET /api/admin/meetings
 * Listar todos os pedidos de reuniao (admin/funcionarios)
 * Mostra pedidos pendentes de agendamento
 */
export async function GET(req: NextRequest) {
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

    const requests = await db
      .select({
        id: meetingRequestsTable.id,
        userId: meetingRequestsTable.userId,
        date: meetingRequestsTable.date,
        startTime: meetingRequestsTable.startTime,
        endTime: meetingRequestsTable.endTime,
        subject: meetingRequestsTable.subject,
        status: meetingRequestsTable.status,
        createdAt: meetingRequestsTable.createdAt,
        userName: utilizadorTable.name,
        userEmail: utilizadorTable.email,
      })
      .from(meetingRequestsTable)
      .leftJoin(utilizadorTable, eq(meetingRequestsTable.userId, utilizadorTable.id))
      .orderBy(desc(meetingRequestsTable.createdAt));

    return NextResponse.json({ success: true, data: requests }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/meetings error", err);
    return NextResponse.json({ success: false, message: "Erro ao listar pedidos" }, { status: 500 });
  }
}
