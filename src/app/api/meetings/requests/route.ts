import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { meetingRequestsTable, siteSettingsTable } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { getTokenFromHeader, validateToken } from "~/lib/auth-comfilar";
import { notifyAdminNewMeeting } from "~/lib/notifications-service";
import {
  MEETING_AVAILABILITY_KEY,
  MEETING_SLOT_MINUTES,
  parseAvailability,
  generateSlots,
} from "~/lib/meeting-availability";

/**
 * GET /api/meetings/requests
 * Listar todos os pedidos de reuniao do utilizador autenticado
 * Requer token JWT valido
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

    const rows = await db.select().from(meetingRequestsTable).where(eq(meetingRequestsTable.userId, payload.userId)).orderBy(meetingRequestsTable.createdAt);
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (err) {
    console.error("GET /meetings/requests error", err);
    return NextResponse.json({ success: false, message: "Erro ao listar pedidos" }, { status: 500 });
  }
}

/**
 * POST /api/meetings/requests
 * Criar novo pedido de reuniao com data e hora
 * Body: { date, start, end, subject? }
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

    const body = await req.json();
    const { date, start, end, subject } = body as { date?: string; start?: string; end?: string; subject?: string };
    if (!date || !start || !end) {
      return NextResponse.json({ success: false, message: "Data, início e fim são obrigatórios" }, { status: 400 });
    }
    if (start >= end) {
      return NextResponse.json({ success: false, message: "Fim deve ser após início" }, { status: 400 });
    }

    // Reforço no servidor: só permitir dentro da disponibilidade definida pelo admin.
    const [setting] = await db
      .select({ value: siteSettingsTable.value })
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, MEETING_AVAILABILITY_KEY))
      .limit(1);
    const availability = parseAvailability(setting?.value);

    // Dia da semana (a partir da parte da data, ao meio-dia UTC para evitar fusos).
    const datePart = String(date).slice(0, 10);
    const [dy, dm, dd] = datePart.split("-").map(Number);
    const weekday = new Date(Date.UTC(dy, (dm || 1) - 1, dd || 1, 12)).getUTCDay();
    if (!availability.weekdays.includes(weekday)) {
      return NextResponse.json(
        { success: false, message: "Esse dia não está disponível para reuniões" },
        { status: 400 },
      );
    }

    // O horário tem de ser um dos slots gerados a partir da disponibilidade.
    const slots = generateSlots(availability.startTime, availability.endTime, MEETING_SLOT_MINUTES);
    if (!slots.includes(start)) {
      return NextResponse.json(
        { success: false, message: "Esse horário não está disponível" },
        { status: 400 },
      );
    }

    // Se a data já vem em formato ISO, usar diretamente
    const jsDate = new Date(date);

    const inserted = await db.insert(meetingRequestsTable).values({
      userId: payload.userId,
      date: jsDate,
      startTime: start,
      endTime: end,
      subject: subject || null,
      status: "pendente",
    });

    // Notifica o staff (admins + funcionários) da nova reunião.
    const meetingId = Number((inserted as unknown as { insertId?: number })?.insertId ?? 0);
    notifyAdminNewMeeting(meetingId).catch((e) =>
      console.error("Erro ao notificar staff da reunião:", e),
    );

    return NextResponse.json({ success: true, message: "Pedido criado" }, { status: 201 });
  } catch (err) {
    console.error("POST /meetings/requests error", err);
    return NextResponse.json({ success: false, message: "Erro ao criar pedido" }, { status: 500 });
  }
}

// PATCH /api/meetings/requests - cancel request (by id)
export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { id, action } = body as { id?: number; action?: "cancel" };
    if (!id || action !== "cancel") {
      return NextResponse.json({ success: false, message: "Parâmetros inválidos" }, { status: 400 });
    }

    await db
      .update(meetingRequestsTable)
      .set({ status: "cancelado" })
      .where(and(eq(meetingRequestsTable.id, id), eq(meetingRequestsTable.userId, payload.userId)));

    return NextResponse.json({ success: true, message: "Pedido cancelado" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /meetings/requests error", err);
    return NextResponse.json({ success: false, message: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
