import { NextRequest, NextResponse } from "next/server";
import { getAllMeetings, getUpcomingMeetings } from "@/lib/queries/meetings-mysql";

/**
 * GET /api/meetings
 * Listar reuniões (admin/funcionarios)
 * Query params:
 * - upcoming: boolean (próximas 7 dias)
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const upcoming = searchParams.get("upcoming") === "true";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0;

    // Validar limites
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: "Limite deve estar entre 1 e 100" },
        { status: 400 },
      );
    }

    let meetings;
    if (upcoming) {
      meetings = await getUpcomingMeetings();
    } else {
      meetings = await getAllMeetings({ limit, offset });
    }

    return NextResponse.json(
      {
        success: true,
        data: meetings.map((meeting: any) => ({
          id: meeting.id,
          date: meeting.date,
          description: meeting.description,
          user: {
            id: meeting.user.id,
            name: meeting.user.name,
            email: meeting.user.email,
            type: meeting.user.type,
          },
        })),
        pagination: {
          limit,
          offset,
          total: meetings.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao listar reuniões:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao listar reuniões" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/meetings
 * Criar nova reunião
 * Body: { userId: number, date: ISO string, description?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { userId?: number; date?: string; description?: string };
    const { userId, date, description } = body;

    // Validar campos obrigatórios
    if (!userId || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "userId e date são obrigatórios",
        },
        { status: 400 },
      );
    }

    // Importar dinamicamente para evitar circular dependency
    const { createMeeting } = await import(
      "@/lib/queries/meetings-mysql"
    );

    const meetingDate = new Date(date);
    if (isNaN(meetingDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Data inválida" },
        { status: 400 },
      );
    }

    const newMeeting = await createMeeting({
      userId,
      date: meetingDate,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reunião criada com sucesso",
        data: {
          id: newMeeting.id,
          date: newMeeting.date,
          description: newMeeting.description,
          userId: newMeeting.userId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar reunião";
    console.error("Erro ao criar reunião:", error);

    return NextResponse.json(
      { success: false, message },
      { status: message.includes("conflito") ? 409 : 500 },
    );
  }
}
