import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { meetingRequestsTable } from "~/db/schema";
import { inArray } from "drizzle-orm";
import { getTokenFromHeader, validateToken } from "~/lib/auth-comfilar";

/**
 * GET /api/meetings/busy
 * Devolve as horas já ocupadas (reuniões pendentes ou aprovadas), agrupadas por
 * dia: { "YYYY-MM-DD": ["09:00", "09:30", ...] }.
 * Só expõe data + hora ocupada — nunca quem marcou nem o assunto.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token =
      getTokenFromHeader(authHeader) || req.cookies.get("auth_token")?.value || null;
    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 });
    }
    const payload = validateToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 });
    }

    // Só reuniões que efetivamente ocupam o slot.
    const rows = await db
      .select({
        date: meetingRequestsTable.date,
        startTime: meetingRequestsTable.startTime,
      })
      .from(meetingRequestsTable)
      .where(inArray(meetingRequestsTable.status, ["pendente", "aprovado"]));

    // Agrupar por dia em UTC (bate com a forma como a data foi guardada).
    const busy: Record<string, string[]> = {};
    for (const r of rows) {
      const d = new Date(r.date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
        d.getUTCDate(),
      ).padStart(2, "0")}`;
      (busy[key] ??= []).push(r.startTime);
    }

    return NextResponse.json({ success: true, data: busy }, { status: 200 });
  } catch (err) {
    console.error("GET /meetings/busy error", err);
    return NextResponse.json(
      { success: false, message: "Erro ao obter disponibilidade" },
      { status: 500 },
    );
  }
}
