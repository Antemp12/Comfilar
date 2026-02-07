import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { meetingRequestsTable, utilizadorTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromHeader, validateToken } from "~/lib/auth-comfilar";
import { createNotification } from "~/lib/notifications-service";

/**
 * POST /api/admin/meetings/create
 * Admin cria reunião para um utilizador
 */
export async function POST(req: NextRequest) {
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

    // Verificar se é admin
    const user = await db
      .select()
      .from(utilizadorTable)
      .where(eq(utilizadorTable.id, payload.userId))
      .limit(1);

    if (!user[0] || (user[0].type !== "admin" && user[0].type !== "funcionario")) {
      return NextResponse.json({ success: false, message: "Sem permissão" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, date, startTime, endTime, subject } = body as {
      userId: number;
      date: string; // YYYY-MM-DD
      startTime: string; // HH:mm
      endTime?: string; // HH:mm
      subject?: string;
    };

    if (!userId || !date || !startTime) {
      return NextResponse.json({ success: false, message: "Campos obrigatórios em falta" }, { status: 400 });
    }

    // Criar data no formato correto - usar UTC para evitar conversão de timezone
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Criar Date object em UTC para corresponder exatamente à data/hora escolhida
    const meetingDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));

    // Calcular hora de fim se não fornecida
    const finalEndTime = endTime || `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Criar reunião com status aprovado (admin já marca diretamente)
    await db.insert(meetingRequestsTable).values({
      userId,
      date: meetingDate,
      startTime,
      endTime: finalEndTime,
      subject: subject || "Reunião agendada pelo admin",
      status: "aprovado", // Já aprovada diretamente
    });

    // Notificar utilizador
    try {
      await createNotification({
        userId,
        type: "reuniao_agendada",
        title: "Nova Reunião Agendada",
        message: `Foi marcada uma reunião para ${new Date(year, month - 1, day).toLocaleDateString("pt-PT")} às ${startTime}.${subject ? `\n\nAssunto: ${subject}` : ""}`,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    }

    return NextResponse.json({ success: true, message: "Reunião criada com sucesso" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/admin/meetings/create error", err);
    return NextResponse.json({ success: false, message: "Erro ao criar reunião" }, { status: 500 });
  }
}
