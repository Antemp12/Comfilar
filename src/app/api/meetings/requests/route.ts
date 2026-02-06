import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { meetingRequestsTable } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { getTokenFromHeader, validateToken } from "~/lib/auth-comfilar";

// GET /api/meetings/requests - list current user's requests
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

// POST /api/meetings/requests - create a new request
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

    const jsDate = new Date(date);

    await db.insert(meetingRequestsTable).values({
      userId: payload.userId,
      date: jsDate,
      startTime: start,
      endTime: end,
      subject: subject || null,
      status: "pendente",
    });

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
